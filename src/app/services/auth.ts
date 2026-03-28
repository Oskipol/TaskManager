import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService{
  currentUser=signal<User |null>(null);
  constructor(private router:Router){
    const stored=localStorage.getItem("user");
    if(stored) this.currentUser.set(JSON.parse(stored));
  }

  saveAuth(token: string, user: User){
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.currentUser.set(null);
    this.router.navigate(["/login"]);
  }
  getToken(): string | null{
    return localStorage.getItem("token");
  }
  isLoggedIn(): boolean{
    return !!this.getToken();
  }
}
