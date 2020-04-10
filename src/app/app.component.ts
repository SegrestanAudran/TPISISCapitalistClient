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
  angegagnes : number;

  constructor(private service: RestserviceService, private notifyService: NotificationService) {
    this.server = service.getServer();
    this.createUsername();
    service.getWorld().then(world => {
      this.world = world;
    });
    //Initialise le revenu avec le bonus des anges si ils sont actif
    setTimeout(() => {
      if(this.world.activeangels != 0){
      this.world.products.product.forEach(produit => {
        produit.revenu = produit.revenu * (1 + (this.world.activeangels * this.world.angelbonus/100));
      });
      }
    }, 100)
  }

  ngOnInit(): void{
    //Met en place les vérifications des managers, anges, upgrades
    setInterval(()=>{
      this.disponibiliteManager()
      this.disponibiliteAngels()
      this.disponibiliteUpgrades()
      this.timeToClaim()
      this.bonusAllunlock()
    },100);
  }

  //Change le nom d'utilisateur du monde
  onUsernameChanged() {
    localStorage.setItem("username", this.username);
    this.service.setUser(this.username);
  }

  //Si le nom d'utilisateur est vide, on génère un nom aléatoire le temps que l'utilisateur le change 
  createUsername() {
    this.username = localStorage.getItem("username");
    console.log(this.username)
    if (this.username == null || this.username == '' ) {
      this.username = 'Hello' + Math.floor(Math.random() * 10000);
      localStorage.setItem("username", this.username);
      console.log(this.username)
    }
    this.service.setUser(this.username);
  }

  //Permet d'envoyer au serveur le début du processus de production
  onEarlyProduction(p: Product){
    this.service.putProduct(p);
  }

  //On récupère les évènement de production des produits pour modifier l'argent et le score du monde
  onProductionDone(p: Product) {
    this.world.money = this.world.money + p.revenu;
    this.world.score = this.world.score + p.revenu;
    this.angegagnes = Math.round(150 * (this.world.score/10**15)**0.5);
  }

  //Alerte le monde d'un achat de produit
  onAchatDone(data) {
    this.world.money = this.world.money - data.cout;
    this.service.putProduct(data.product);
  }

  //Donne les différentes valeur a qmulti pour les achats multiple
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

  //Fonction d'achat de manager
  achatManager(manager) {
    if (this.world.money >= manager.seuil) {
      this.world.money -= manager.seuil;
      manager.unlocked = true;
      this.world.products.product[manager.idcible - 1].managerUnlocked = true;
      this.notifyService.showSuccess("Achat de " + manager.name + " effectué", "Manager")
      this.service.putManager(manager);
    }
  }

  //Fonction d'achat d'amélioration
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

  //Fonction d'achat d'amélioration d'ange
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

  //Gère les bonus dans all unlocks
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

  //Fonction pour gérer le restart du monde
  claimAndRestart(): void {
    this.service.deleteWorld();
    window.location.reload();
  }

  //Fonction de mise à jour des revenus lors d'un achat sur les anges
  updateProductRevenu(seuil){
    if(this.world.activeangels != 0){ 
    this.world.products.product.forEach(product => {
      product.revenu = product.revenu * this.world.activeangels * this.world.angelbonus/(this.world.activeangels+seuil);
    });
  }
  }

  //Fonctions de vérification de disponibilité
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
      if(this.world.totalangels*2 <= this.angegagnes){
        this.dInvest = true;
      }
    }
  }
}
