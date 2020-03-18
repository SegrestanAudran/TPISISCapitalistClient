import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { World, Pallier, Product } from '../world';


@Injectable({
  providedIn: 'root'
})
export class RestserviceService {
  server = "http://localhost:8080/adventureisis/";
  user = "";
 

  constructor(private http: HttpClient) { }
  
  public getUser(){
    return this.user;
  }

  public setUser(user : string){
    this.user = user;
  }

  public getServer(){
    return this.server;
  }

  public setServer(server : string){
    this.server = server;
  }



  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
   }
   getWorld(): Promise<World> {
    return this.http.get(this.server + "generic/world")
    .toPromise().catch(this.handleError);
   };
}
