import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
  <div class="w-full h-full flex top-0 justify-center items-center relative overflow-y-scroll min-h-screen overflow-x-hidden bg-gray-900">
    <div style="container-type: inline-size;" class="lg:w-[30%] md:w-[40%] w-[70%] py-[5%] relative flex justify-between items-center flex-col bg-gray-800 rounded-2xl">
      <h1 class="text-white font-bold relative rationale-regular" style="font-size: 10cqi;">Login</h1>
      <div class="w-full h-[50%] my-[10%] relative rationale-regular justify-center flex flex-col gap-4 items-center">
        <input [(ngModel)]="email" type="email" class="bg-gray-700 w-[80%] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email">
        <input [(ngModel)]="password" class="bg-gray-700 w-[80%] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password">
       @if(error()){
        <p class="text-red-400 text-lg">{{error()}}</p>
      }
      <button (click)="login()" class="bg-blue-600 w-[40%] hover:bg-blue-700 duration-300 cursor-pointer text-white py-2 px-4 rounded-lg transition-colors">Login</button>
      </div>
      <p class="text-gray-400 rationale-regular text-center">
  <span (click)="ForgotMode.set(true)" class="text-blue-400 cursor-pointer hover:underline duration-300">Forgot password?</span>
</p>
      <p  class="text-gray-400 rationale-regular text-center">You don't have an account? <a routerLink="/register" class="text-blue-400 hover:underline duration-300">Register</a></p>
      @if(ForgotMode()) {
  <input [(ngModel)]="forgotEmail" type="email" placeholder="Your email"
    class="bg-gray-700 w-[80%] my-5 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"/>
  <button (click)="forgotPassword()" class="bg-blue-600 w-[40%] hover:bg-blue-700 duration-300 cursor-pointer text-white py-2 px-4 rounded-lg">
    Send
  </button>
}
  </div>
  `,
  styleUrl: './login.css',
})
export class Login {
  email='';
  password='';
  error=signal('');
  ForgotMode = signal(false);
forgotEmail = '';
  constructor(private api: ApiService, private auth: AuthService, private router: Router){}
  

forgotPassword() {
  this.api.forgotPassword(this.forgotEmail).subscribe({
    next: () => {
      this.ForgotMode.set(false);
      this.error.set("Check your email for reset link");
    },
    error: () => this.error.set("Email not found")
  });
}
  login(){
    if(this.email&&this.password){
    this.api.login(this.email, this.password).subscribe({
      next: res=>{
        this.auth.saveAuth(res.token, {id: 0, username: res.username, email: this.email});
        this.router.navigate(['/dashboard']);
      },
      error:()=>{
        this.error.set("Wrong email or password");
      }
    });}
    else{
      this.error.set("Fill out every field");
    }
  }
}
