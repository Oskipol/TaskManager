import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
  <div class="w-full h-full flex top-0 justify-center items-center relative overflow-y-scroll min-h-screen overflow-x-hidden bg-gray-900">
    <div style="container-type: inline-size;" class="lg:w-[30%] md:w-[40%] w-[70%] py-[5%] relative flex justify-between items-center flex-col bg-gray-800 rounded-2xl">
      <h1 class="text-white font-bold relative rationale-regular" style="font-size: 10cqi;">Register</h1>
      <div class="w-full h-[50%] my-[10%] relative rationale-regular justify-center flex flex-col gap-4 items-center">
        <input [(ngModel)]="username" type="text" class="bg-gray-700 w-[80%] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Username">
        <input [(ngModel)]="email" type="email" class="bg-gray-700 w-[80%] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email">
        <input [(ngModel)]="password1" class="bg-gray-700 w-[80%] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password">
        <input [(ngModel)]="password2" type="password" class="bg-gray-700 w-[80%] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Repeat password">
        @if(error()){
        <p class="text-red-400 text-lg">{{error()}}</p>
      }
      <button (click)="register()" class="bg-blue-600 w-[40%] hover:bg-blue-700 duration-300 cursor-pointer text-white py-2 px-4 rounded-lg transition-colors">Register</button>    
      </div>
      <p  class="text-gray-400 rationale-regular text-center">You already have an account? <a routerLink="/login" class="text-blue-400 cursor-pointer hover:underline duration-300">Login</a></p>
      
  </div>
  `,
  styleUrl: './register.css',
})
export class Register {
  username='';
  email='';
  password1='';
  password2='';
  error=signal('');
  constructor(private api: ApiService, private auth: AuthService, private router: Router){}
  register(){
    if(this.password1===this.password2){
      if(this.username&&this.email&&this.password1){
        if(!this.email.includes("@")){
          this.error.set("Email is not valid");
          return;
        }
        if(this.password1.length<6){
          this.error.set("Password must be at least 6 characters long");
          return;
        }
        if(this.username.length<3||this.username.length>20){
          this.error.set("Username must be between 3 and 20 characters long");
          return;
        }
    this.api.register(this.username, this.email, this.password1).subscribe({
      next: res=>{
        this.auth.saveAuth(res.token, {id: 0, username: res.username, email: this.email});
        this.router.navigate(["/dashboard"]);
      },
      error:()=>{
        this.error.set("Error");
      }
    });
    }else{this.error.set("Fill out every field");}}
    else{
      this.error.set("Passwords doesn't match");
    }
  }
}
