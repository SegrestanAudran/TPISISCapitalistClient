declare var require;
const ProgressBar = require("progressbar.js");
import { RestserviceService } from '../restservice.service';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { Product, World } from 'src/world';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})



export class ProductComponent implements OnInit {
  @ViewChild('bar') progressBarItem: ElementRef;
  progressbar: any;
  lastupdate: number;
  progressDone: boolean;
  vitesse: number;
  idBar: string;
  initRevenu: number = 0;
  progress: any;
  run: boolean;
  world : World;

  constructor(private service: RestserviceService, private notifyService: NotificationService) { 
    service.getWorld().then(world => {
      this.world = world;
    });
  }

  product: Product;
  @Input()
  set prod(value: Product) {

    this.product = value;
    if (this.initRevenu == 0) {
      this.initRevenu = this.product.revenu;
    }
    console.log(this.product.timeleft)
    if(this.product.timeleft < 0){
      this.product.timeleft = 0;
    }
    if(this.product.timeleft > 10**12){
      this.product.timeleft =0;
      this.run = false;
    }
    setTimeout(()=>{
    if (this.product.managerUnlocked && this.product.timeleft > 0) {
      this.run = true;
      this.progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;
      this.progressbar.animate(1, { duration: this.progress });
    }
  },100)
  }


  money: number;
  @Input()
  set mon(value: number) {
    this.money = value;
  }

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
  }

  @Output() notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();
  @Output() notifyMoney: EventEmitter<number> = new EventEmitter<number>();



  ngOnInit(): void {
    setInterval(() => { this.calcScore(); }, 100);
  }

  ngAfterViewInit() {

    setTimeout(() => {
      console.log("Coucou, ça marche l'initialisation ?");
      this.progressbar = new ProgressBar.Line(this.progressBarItem.nativeElement, {
        strokeWidth: 4,
        easing: 'easeInOut',
        color: '#FFEA82',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: { width: '100%', height: '100%' },
        from: { color: '#FFEA82' },
        to: { color: '#faacd3' },
        step: (state, bar) => {
          bar.path.setAttribute('stroke', state.color);
        }
      });
    }, 100)
  }



  production() {
    console.log("coucou ça marche ?")
    if (this.product.quantite >= 1 && this.run == false) {
      this.progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;

      this.progressbar.animate(1, { duration: this.progress });
      this.product.timeleft = this.product.vitesse;
      this.lastupdate = Date.now();
      this.run = true;
    }

  }
  calcScore() {
    if (this.run) {
      console.log(this.product.timeleft)
      if (this.product.timeleft > 0) {
        this.product.timeleft = this.product.timeleft - (Date.now() - this.lastupdate);
      } else {
        this.progressbar.set(0);
        this.product.timeleft = 0;
        this.lastupdate = 0;
        this.run = false;
        this.service.putProduct(this.product);
        this.notifyProduction.emit(this.product);
      }

    }
    if (this.product.managerUnlocked) {
      this.production();
    }

  }



  calcMaxCanBuy(): number {
    let cost: number = this.product.cout;
    let maxCanBuy: number = 0;
    while (cost <= this.money) {
      maxCanBuy += 1;
      cost = cost + this.product.cout * this.product.croissance ** (maxCanBuy);
    }
    return maxCanBuy;
  }

  achatProduit() {
    let cost: number;

    if (this._qtmulti <= this.calcMaxCanBuy()) {
      cost = this.product.cout * this._qtmulti;
      this.product.cout = this.product.cout * this.product.croissance ** this._qtmulti;
      this.product.revenu = (this.product.revenu / this.product.quantite) * (this.product.quantite + this._qtmulti);
      this.product.quantite += this._qtmulti;
      this.notifyMoney.emit(cost);
      this.service.putProduct(this.product);
    }
  }
}

