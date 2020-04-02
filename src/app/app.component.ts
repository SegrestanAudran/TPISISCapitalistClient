import { Component, Input, ViewChildren, QueryList } from '@angular/core';
import { RestserviceService } from './restservice.service';
import { World, Product, Pallier } from '../world';
import { NotificationService } from './notification.service';
import { ProductComponent } from './product/product.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChildren(ProductComponent) productsComponent: QueryList<ProductComponent>;
  title = 'TPISISCapitalistClient';
  world: World = new World();
  server: string;
  qtmulti: string = "1";
  username: string = '';

  constructor(private service: RestserviceService, private notifyService: NotificationService) {
    this.server = service.getServer();
    this.createUsername();

    service.getWorld().then(world => {
      this.world = world;
    });
    setTimeout(()=>{console.log(this.world.money);}, 100)
  }

  /* ngOnInit(): void{
    setInterval(()=>{
      this.service.saveWorld(this.world);
    },1000);
  } */

  onUsernameChanged() {
    localStorage.setItem("username", this.username);
    this.service.setUser(this.username);
  }

  createUsername() {
    this.username = localStorage.getItem("username");
    if (this.username == '') {
      this.username = 'Hello' + Math.floor(Math.random() * 10000);
      localStorage.setItem("username", this.username);
    }
    this.service.setUser(this.username);
  }

  onProductionDone(p: Product) {
    this.world.money = this.world.money + p.revenu;
    //this.world.score = this.world.score + p.revenu;
  }

  onAchatDone(argentDepense: number) {
    this.world.money = this.world.money - argentDepense;
  }

  commutateur() {
    switch (this.qtmulti) {
      case "1":
        this.qtmulti = "10";
        break;
      case "10":
        this.qtmulti = "100";
        break;
      case "100":
        this.qtmulti = "max";
        break;
      case "max":
        this.qtmulti = "1";
        break;
      default:
        this.qtmulti = "1";
    }
  }
  achatManager(manager) {
    if (this.world.money >= manager.seuil) {
      this.world.money -= manager.seuil;
      manager.unlocked = true;
      this.world.products.product[manager.idcible - 1].managerUnlocked = true;
      this.notifyService.showSuccess("Achat de " + manager.name + " effectué", "Manager")
      this.service.putManager(manager);
    }
  }
   achatUpgrade(upgrade) {
    if (this.world.money >= upgrade.seuil) {
      this.world.money -= upgrade.seuil;
      upgrade.unlocked = true;
      if (upgrade.idcible == 0) {
        switch (upgrade.typeratio) {
          case "VITESSE":
            this.world.products.product.forEach(p => {
              p.vitesse = p.vitesse / upgrade.ratio;
            });
            break;
          case "GAIN":
            this.world.products.product.forEach(p => {
              p.revenu = p.revenu * upgrade.ratio;
            });
            break;
        }
      } else {
        switch (upgrade.typeratio) {
          case "VITESSE":
            this.world.products.product[upgrade.idcible - 1].vitesse = this.world.products.product[upgrade.idcible - 1].vitesse / upgrade.ratio;
            break;
          case "GAIN":
            this.world.products.product[upgrade.idcible - 1].vitesse = this.world.products.product[upgrade.idcible - 1].revenu * upgrade.ratio;
            break;
        }
        this.notifyService.showSuccess("achat d'un upgrade de " + upgrade.typeratio + " pour " + this.world.products.product[upgrade.idcible-1].name, "Upgrade"); 
      }
    }
  }

  achatAnge(angel) {
    if (this.world.activeangels >= angel.seuil) {
      this.world.activeangels -= angel.seuil;
      angel.unlocked = true;
      switch (angel.typeratio) {
        case "ANGE":
          this.world.angelbonus += angel.ratio;
          break;
        case "VITESSE":
          if (angel.idcible == 0) {
            this.world.products.product.forEach(p => {
              p.vitesse = p.vitesse / angel.ratio;
            });
            this.notifyService.showSuccess("achat d'un upgrade de " + angel.typeratio + " pour tous les produits", "Upgrade Angels");
          } else {
            this.world.products.product[angel.idcible - 1].vitesse = this.world.products.product[angel.idcible - 1].vitesse / angel.ratio;
            this.notifyService.showSuccess("achat d'un upgrade de " + angel.typeratio + " pour " + this.world.products.product[angel.idcible-1].name, "Upgrade Angels")

          }
          break;
        case "GAIN":
          if (angel.idcible == 0) {
            this.world.products.product.forEach(p => {
              p.revenu = p.revenu * angel.ratio;
            });
            this.notifyService.showSuccess("achat d'un upgrade de " + angel.typeratio + " pour tous les produits", "Upgrade Angels");
          } else {
            this.world.products.product[angel.idcible - 1].revenu = this.world.products.product[angel.idcible - 1].revenu / angel.ratio;
            this.notifyService.showSuccess("achat d'un upgrade de " + angel.typeratio + " pour " + this.world.products.product[angel.idcible-1].name, "Upgrade Angels")

          }
          break;
      }
    }

  } 

}
