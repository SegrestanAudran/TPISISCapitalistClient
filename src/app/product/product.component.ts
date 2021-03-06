import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { Product, World, Pallier } from 'src/world';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})



export class ProductComponent implements OnInit {
  progressbar: any;
  lastupdate: number;
  vitesse: number;
  initRevenu: number = 0;
  progress: any;
  run: boolean = false;
  cost : number;
  progressbarvalue: number = 0;

  constructor(private notifyService: NotificationService) {
    
  }

  product: Product;
  @Input()
  set prod(value: Product) {

    this.product = value;
    //On garde en mémoire le cout du produit pour l'afficher
    this.cost = this.product.cout;

    //On garde en mémoire le revenu initale du produit
    if (this.initRevenu == 0) {
      this.initRevenu = this.product.revenu;
    }

    //On s'assure que le timeleft sauvegarder dans le serveur ne soit pas érroner
    if (this.product.timeleft < 0) {
      this.product.timeleft = 0;
    }
    if (this.product.timeleft > 10 ** 12) {
      this.product.timeleft = 0;
      this.run = false;
    }

    //On initialise la progressbar en fonction des données du serveur
    setTimeout(() => {
      if (this.product && this.product.timeleft > 0) {
        this.run = true;
        this.progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
        this.progressbarvalue = this.progress*100;
      }
    }, 100)
  }

  //On récupère l'argent du monde
  money: number;
  @Input()
  set mon(value: number) {
    this.money = value;
  }

  //On récupère le modificateur d'achat multiple
  _qtmulti: number;
  @Input()
  set qtmulti(value: string) {
    switch (value) {
      case "1":
        this._qtmulti = 1;
        break;
      case "10":
        this._qtmulti = 10;
        break;
      case "100":
        this._qtmulti = 100;
        break;
      case "max":
        this._qtmulti = 1000;
        break;
    }
    if (this._qtmulti == 1000 && this.product) this._qtmulti = this.calcMaxCanBuy();
    //On met à jour csot à chaque changement de qtmulti
    this.cost = this.product.cout * ((1 - this.product.croissance ** this._qtmulti)/(1-this.product.croissance));
  }

  //On nitifie le monde des évènements
  @Output() notifyBeforeProduction: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() notifyMoney = new EventEmitter();

  //On initialise le calcule des revenus
  ngOnInit(): void {
    setInterval(() => { this.calcScore(); }, 100);
  }

  //Fonction de lancement de production
  production() {
    if (this.product.quantite >= 1 && this.run == false) {
      this.progressbarvalue = 0
      if(!this.product.managerUnlocked){
        this.notifyBeforeProduction.emit(this.product);
      }
      this.product.timeleft = this.product.vitesse;
      this.lastupdate = Date.now();
      this.run = true;
    }
  }

  //Fonction de calcul des revenus
  calcScore() {
    if (this.run) {
      //Permet de vérifier 
      let lastunlock: any;
      if (lastunlock == null) {
        this.product.palliers.pallier.forEach(pallier => {
          if (pallier.unlocked) {
            lastunlock = pallier;
          }
        });
      }else{
        this.product.palliers.pallier.forEach(pallier => {
          if (pallier.unlocked && pallier.seuil>lastunlock.seuil && pallier.typeratio=='vitesse') {
            lastunlock = pallier;
            this.product.timeleft = this.product.timeleft / lastunlock.ratio;
            this.progressbarvalue = this.product.timeleft*100/this.product.vitesse;
          }
        });
      }
      //Mise à jour de la progression
      if (this.product.timeleft > 0) {
        this.product.timeleft = this.product.timeleft - (Date.now() - this.lastupdate);
        if(this.product.timeleft<0) this.product.timeleft=0
        this.progressbarvalue = 100 - (this.product.timeleft * 100/ this.product.vitesse);
        this.lastupdate = Date.now();
      } else {
        this.progressbarvalue = 0;
        this.product.timeleft = 0;
        this.lastupdate = 0;
        this.run = false;
        this.notifyProduction.emit(this.product);
      }
    }
    if (this.product.managerUnlocked) {
      this.production();
    }

  }

  //Fonction de calcul du maximum d'achat possible
  calcMaxCanBuy(): number {
    let cost: number = this.product.cout;
    let maxCanBuy: number = 0;
    while (cost <= this.money) {
      maxCanBuy += 1;
      cost = cost + this.product.cout * this.product.croissance ** (maxCanBuy);
    }
    return maxCanBuy;
  }

  //Fonction d'achat d'un produit
  achatProduit() {
    this.cost = this.product.cout;
    if (this._qtmulti <= this.calcMaxCanBuy()) {
      this.cost = this.product.cout * ((1 - this.product.croissance ** this._qtmulti)/(1-this.product.croissance));
      this.product.cout = this.product.cout * this.product.croissance ** this._qtmulti;
      if(this.product.quantite != 0){
        this.product.revenu = (this.product.revenu / this.product.quantite) * (this.product.quantite + this._qtmulti);
      }
      this.product.quantite += this._qtmulti;
      this.notifyMoney.emit({cout: this.cost, product: this.product });
      this.product.palliers.pallier.forEach(pallier => {
        if (!pallier.unlocked && this.product.quantite >= pallier.seuil) {
          pallier.unlocked = true;
          this.calcUpgrade(pallier);
          this.notifyService.showSuccess("déblocage d'un bonus " + pallier.typeratio + " effectué pour " + this.product.name, "BONUS");
        }
      })
      this.cost = this.product.cout * ((1 - this.product.croissance ** this._qtmulti)/(1-this.product.croissance));
    }
  }

  //Fonction de prise en compte des amélirations des produits
  calcUpgrade(pallier: Pallier) {
    switch (pallier.typeratio) {
      case 'vitesse':
        this.product.vitesse = this.product.vitesse / pallier.ratio;
        this.product.timeleft = this.product.timeleft / pallier.ratio;
        this.progressbarvalue = this.progressbarvalue * pallier.ratio;
        break;
      case 'gain':
        this.product.revenu = this.product.revenu * pallier.ratio;
        break;
    }
  }
}

