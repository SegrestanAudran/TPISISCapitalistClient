declare var require;
const ProgressBar = require("progressbar.js");

import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { Product } from 'src/world';


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})



export class ProductComponent implements OnInit {
  @ViewChild('bar') progressBarItem: ElementRef;
  progressbar: any;
  lastupdate: number;
  progressDone : boolean;
  vitesse : number;
  idBar : string;
  initRevenu : number = 0;



  product: Product;
  @Input()
  set prod(value: Product) {
    //console.log(value.vitesse)
    
    this.product = value;
    this.product.timeleft = 0;
    if(this.initRevenu == 0){
      this.initRevenu = this.product.revenu;
    }
    /*this.idBar = "bar"+value.id;*/
}
  
  
  money: number;
  @Input()
  set mon(value: number) {
    this.money = value;
  }

  _qtmulti: number;
  @Input()
  set qtmulti(value: string) {
    switch(value){
      case "1":
        this._qtmulti = 1;
        break;
      case "10":
        this._qtmulti = 10;
        break;
      case "100":
        this._qtmulti = 100;
        break;
      case "max" :
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

  ngAfterViewInit(){

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
    if (this.product.quantite >= 1 && this.product.timeleft == 0) {
      console.log(this.product.vitesse)
      //let progress = (this.product.vitesse - this.product.timeleft) / this.product.vitesse;

      this.progressbar.animate(1, this.product.vitesse);
      this.product.timeleft = this.product.vitesse;
      this.lastupdate = Date.now();
    }
    
  }
  calcScore() {
    console.log(this.product.timeleft)
    if (this.product.timeleft != 0) {
      console.log("Coucou, est-ce que ça marche le calcule du score ?")
      console.log(Date.now())
      this.product.timeleft = this.product.timeleft - (Date.now() - this.lastupdate);
      console.log(this.product.timeleft)
      if (this.product.timeleft <= 0) {
        console.log("Est ce que ça marche ici aussi ?")
        this.progressbar.set(0);
        this.product.timeleft = 0;
        this.notifyProduction.emit(this.product);
      }
    }
    if(this.product.managerUnlocked){
      this.production();
    }
  }
 

 
 calcMaxCanBuy(): number {
    let cost: number= this.product.cout;
    let maxCanBuy: number = 0;
    while(cost <= this.money){
      maxCanBuy+=1;
      cost = cost + this.product.cout * this.product.croissance **(maxCanBuy);
      }
    return maxCanBuy;
    }
  
  achatProduit(){
    let cost : number;
    if(this._qtmulti <= this.calcMaxCanBuy()){
      cost = this.product.cout * this._qtmulti;
      this.product.cout = this.product.cout * this.product.croissance**this._qtmulti;
      this.product.quantite += this._qtmulti; 
      this.product.revenu = this.initRevenu * this.product.quantite;
      this.notifyMoney.emit(cost);
    }
  }
}

