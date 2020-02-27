import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { World, Pallier, Product } from '../world';



@Injectable({
  providedIn: 'root'
})
export class RestserviceService {
  server = "http://localhost:8080/adventureISIS/";
  user = "";

  constructor(private http: HttpClient) { }

  public getUser(){
    return this.user;
  }

  public setUser(user : string){
    this.user = user;
  }

}
