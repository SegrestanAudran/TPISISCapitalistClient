import { Component, Input } from '@angular/core';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from '../world';
import { ToastrModule } from 'ngx-toastr';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'TPISISCapitalistClient';
  world: World = new World();
  server: string;
  qtmulti : string = "1";
  
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

  onAchatDone( argentDepense: number){
    this.world.money = this.world.money - argentDepense;
  }

  commutateur(){
    switch(this.qtmulti){
      case "1":
        this.qtmulti = "10";
        break;
      case "10":
        this.qtmulti = "100";
        break;
      case "100":
        this.qtmulti = "max";
        break;
      case "max" :
        this.qtmulti = "1";
        break;
      default:
        this.qtmulti = "1";
    }
  }
  achatManager(manager){
    if(this.world.money >= manager.seuil){
      this.world.money -= manager.seuil;
      manager.unlocked = true;
      this.world.products.product[manager.idcible-1].managerUnlocked = true;
    }
  }
}
