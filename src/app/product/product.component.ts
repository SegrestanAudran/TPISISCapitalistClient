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
  cost : number;



  product: Product;
  @Input()
  set prod(coucou: Product) {
    //console.log(value.vitesse)
    this.product = coucou;
    /*this.idBar = "bar"+value.id;*/
}
  
  
  money: number;
  @Input()
  set mon(value: number) {
    this.money = value;
  }

  _qtmulti: string;
  @Input()
  set qtmulti(value: string) {
    this._qtmulti = value;
    if (this._qtmulti == "max" && this.product) this.calcMaxCanBuy();
 }

  @Output() notifyProduction: EventEmitter<Product> = new EventEmitter<Product>();

 


  ngOnInit(): void {
    setInterval(() => { this.calcScore(); }, 100);
  }

  ngAfterViewInit(){

    setTimeout(() => {
      console.log("Coucou, ça marche l'initialigsation ?");
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
    if (this.product.quantite >= 0 && this.product.timeleft == 0) {
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
  }
 

 
 calcMaxCanBuy(): number {
    this.cost = this.product.cout;
    let maxCanBuy = 0;
    while(this.cost <= this.money){
      this.cost = this.cost + this.product.cout * this.product.croissance **(maxCanBuy+1);
      maxCanBuy+=1;
      }
    return maxCanBuy;
    }
}

