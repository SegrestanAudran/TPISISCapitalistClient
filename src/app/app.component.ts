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
  dManager: boolean;
  dUpgrade: boolean;
  dAngel: any;
  dInvest: boolean;

  constructor(private service: RestserviceService, private notifyService: NotificationService) {
    this.server = service.getServer();
    this.createUsername();

    service.getWorld().then(world => {
      this.world = world;
    });
    if(this.world.activeangels != 0){
    this.world.products.product.forEach(produit => {
      produit.revenu = produit.revenu * this.world.activeangels * this.world.angelbonus
    });
    }
    setTimeout(() => { console.log(this.world.money); }, 100)
  }

  ngOnInit(): void{
    setInterval(()=>{
      this.disponibiliteManager()
      this.disponibiliteAngels()
      this.disponibiliteUpgrades()
      this.bonusAllunlock()
    },100);
  }

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

  onEarlyProduction(p: Product){
    this.service.putProduct(p);
  }

  onProductionDone(p: Product) {
    this.world.money = this.world.money + p.revenu;
    console.log(this.world.money)
    this.world.score = this.world.score + p.revenu;
    console.log(this.world.score)
    this.world.totalangels = 150 * (this.world.score/10**15)**0.5;
  }

  onAchatDone(data) {
    this.world.money = this.world.money - data.cout;
    console.log(data.cout)
    this.service.putProduct(data.product);
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

      this.service.putUpgrade(upgrade);
      upgrade.unlocked = true;
      if (upgrade.idcible == 0) {
        this.productsComponent.forEach(product => product.calcUpgrade(upgrade))
        this.notifyService.showSuccess("achat d'un upgrade de " + upgrade.typeratio + " pour tous les produits", "Upgrade global");
      } else {
        this.productsComponent[upgrade.idcible - 1].calcUpgrade(upgrade);
        this.notifyService.showSuccess("achat d'un upgrade de " + upgrade.typeratio + " pour " + this.world.products.product[upgrade.idcible - 1].name, "Upgrade");
      }
    }
  }

  achatAnge(angel) {
    if (this.world.activeangels >= angel.seuil) {
      this.world.activeangels -= angel.seuil;
      angel.unlocked = true;
      if (angel.typeratio == "ange") {
        this.world.angelbonus += angel.ratio;
      } else {
        if (angel.idcible == 0) {
          this.productsComponent.forEach(product => product.calcUpgrade(angel))
          this.notifyService.showSuccess("achat d'un upgrade de " + angel.typeratio + " pour tous les produits", "Upgrade Angels");
        } else {
          this.productsComponent[angel.idcible - 1].calcUpgrade(angel)
          this.notifyService.showSuccess("achat d'un upgrade de " + angel.typeratio + " pour " + this.world.products.product[angel.idcible - 1].name, "Upgrade Angels")
        }
      }
      
      this.updateProductRevenu(angel.seuil);
      this.service.putAngel(angel);
    }



  }
  bonusAllunlock() {
    //on recherche la quantité minmal des produits
    let min = Math.min(
      ...this.productsComponent.map(p => p.product.quantite)
    )
    this.world.allunlocks.pallier.map(pallier => {
      //si la quantité minimal dépasse le seuil, on débloque le produit concerné
      if (!pallier.unlocked && min >= pallier.seuil) {
        pallier.unlocked = true;
        this.productsComponent.forEach(prod => prod.calcUpgrade(pallier))
        this.notifyService.showSuccess("Bonus de " + pallier.typeratio + " effectué sur tous les produits", "bonus global");
      }
    })
  }

  claimAndRestart(): void {
    this.service.deleteWorld();
    window.location.reload();
  }

  updateProductRevenu(seuil){
    if(this.world.activeangels != 0){ 
    this.world.products.product.forEach(product => {
      product.revenu = product.revenu * this.world.activeangels * this.world.angelbonus/(this.world.activeangels+seuil);
    });
  }
  }

  disponibiliteManager(): void {
    this.dManager = false;
    this.world.managers.pallier.forEach(val => {
      if (!this.dManager) {
        if (this.world.money > val.seuil && !val.unlocked) {
          this.dManager = true;
        }
      }
    })
  }

  disponibiliteUpgrades() {
    this.dUpgrade = false;
    this.world.upgrades.pallier.map(upgrade => {
      if (!this.dUpgrade) {
        if (!upgrade.unlocked && this.world.money > upgrade.seuil) {
          this.dUpgrade = true
        }
      }
    })
  }

  disponibiliteAngels() {
    this.dAngel = false;
    this.world.angelupgrades.pallier.map(angel => {
      if (!this.dAngel) {
        if (!angel.unlocked && this.world.activeangels > angel.seuil) {
          this.dAngel = true
        }
      }
    })
  }

  timeToClaim() {
    this.dInvest = false;
    if(this.world.activeangels != 0){
      if(this.world.activeangels*2 >= this.world.totalangels){
        this.dInvest = true;
      }
    }
  }
}
