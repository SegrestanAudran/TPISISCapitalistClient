import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { World, Pallier, Product } from '../world';


@Injectable({
  providedIn: 'root'
})
export class RestserviceService {
  server = "http://localhost:8080/adventureisis/";
  user = "";


  constructor(private http: HttpClient) { }

  public getUser() {
    return this.user;
  }

  public setUser(user: string) {
    this.user = user;
  }

  public getServer() {
    return this.server;
  }

  public setServer(server: string) {
    this.server = server;
  }




  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }


  //Fonction de récupération du monde
  getWorld(): Promise<World> {
    return this.http.get(this.server + "generic/world", {
      headers: this.setHeaders(this.getUser())
    })
      .toPromise().then(response => response)
      .catch(this.handleError);
  };


  //Fonction de set du Header
  private setHeaders(user: string): HttpHeaders {
    var headers = new HttpHeaders({ 'X-User': user});

    return headers;
  }

  //Fonction de sauvegarde d'un manager
  public putManager(manager: Pallier): Promise<Response> {
    return this.http.put(this.server + "generic/manager", manager, {
      headers: { "X-user": this.getUser() }
    })
      .toPromise().then(response => response)
      .catch(this.handleError);
  }

  //Fonction de sauvegarde d'un produit
  public putProduct(product: Product): Promise<Response> {
    return this.http.put(this.server + "generic/product", product, {
      headers: { "X-user": this.getUser() }
    })
      .toPromise().then(response => response)
      .catch(this.handleError);
  };

  //Fonction de sauvegarde d'une amélioration
  public putUpgrade(upgrade: Pallier): Promise<Response> {
     return this.http
       .put(this.server + "generic/upgrade", upgrade, {
         headers: { "X-user": this.getUser() }
       })
       .toPromise()
       .then(response => response)
       .catch(this.handleError);
   }
   
   //Fonction de suppresion du monde
   public deleteWorld(): Promise<Response> {
     return this.http
       .delete(this.server + "generic/world", {
         headers: this.setHeaders(this.getUser())
       })
       .toPromise().then(response => response)
       .catch(this.handleError);
   }

   //Fonction de sauvegarde d'achat d'amélioration d'ange
   public putAngel(angel: Pallier): Promise<Response> {
     return this.http
       .put(this.server + "generic/angelUpgrade", angel, {
         headers: { "X-user": this.getUser() }
       })
       .toPromise()
       .then(response => response)
       .catch(this.handleError);
   }

}
