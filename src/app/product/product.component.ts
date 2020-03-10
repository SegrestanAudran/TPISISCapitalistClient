declare var require;
const ProgressBar = require("progressbar.js");

import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Product } from 'src/world';
import { MonoTypeOperatorFunction } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})



export class ProductComponent implements OnInit {
  progressbar : any;
  lastupdate : number;
  @ViewChild('bar') progressBarItem;

  constructor() { }

  

  ngOnInit(): void {
    this.progressbar = new ProgressBar.Line(this.progressBarItem.nativeElement, {
      strokeWidth: 4,
      easing: 'easeInOut',
      duration: 1400,
      color: '#FFEA82',
      trailColor: '#eee',
      trailWidth: 1,
      svgStyle: {width: '100%', height: '100%'},
      from: {color: '#FFEA82'},
      to: {color: '#ED6A5A'},
      step: (state, bar) => {
        bar.path.setAttribute('stroke', state.color);
      }
    });
  }

  product: Product;
  @Input()
  set prod(value: Product) {
    this.product = value;
    }
  
  money : number;
  @Input()
  set mon(value : number){
    this.money = value;
  }

  


  production(){
    if(this.product.quantite > 1) {
      this.progressbar.animate(1, { duration: this.product.vitesse });
      this.product.timeleft = this.product.vitesse;
      this.lastupdate = Date.now();
    }
  }

  
}
