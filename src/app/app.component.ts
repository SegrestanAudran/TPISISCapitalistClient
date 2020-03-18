import { Component, Input } from '@angular/core';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from '../world';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'TPISISCapitalistClient';
  world: World = new World();
  server: string;
  qtmulti : string;
  
  constructor(private service: RestserviceService) {
    this.server = service.getServer();
    service.getWorld().then(world => {
      this.world = world;
      });
      }

  onProductionDone( p : Product) {
    this.world.money = this.world.money + p.revenu;
    this.world.score = this.world.score + p.revenu;
  }

  commutateur(){
    switch(this.qtmulti){
      case "x1":
        this.qtmulti = "x10";
        break;
      case "x10":
        this.qtmulti = "x100";
        break;
      case "x100":
        this.qtmulti = "max";
        break;
      case "max" :
        this.qtmulti = "x1";
        break;
      default:
        this.qtmulti = "x1";
    }
  }
}
