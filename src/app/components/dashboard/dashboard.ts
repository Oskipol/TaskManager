import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { Board } from '../../models/board.model';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
  template: `
   <div class="w-full h-full bg-gray-900 inset-0 min-h-screen">
    <div style="container-type: inline-size;" class="relative top-0 left-0 h-[10%] min-h-15 w-full flex justify-between items-center px-[5%]">
      <h1 style="font-size: 5cqi;" class="rationale-regular font-bold text-white">Your Boards</h1>
      <button (click)="logout()" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 cursor-pointer duration-300 rounded">Logout</button>
    </div>
    <div class="relative w-full bg-gray-800 px-[5%] h-[10%] min-h-25 rationale-regular flex justify-start items-center">
      <input [(ngModel)]="newBoardName" type="text" class="bg-gray-700 w-[20%] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="New board name">
      <button (click)="createBoard()" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 cursor-pointer duration-300 rounded ml-4">Create Board</button>
      <input [(ngModel)]="joinCode" type="text" class="bg-gray-700 ml-4 w-[20%] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Join code">
      <button (click)="joinBoard()" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 cursor-pointer duration-300 rounded ml-4">Join Board</button>
    </div>
    <div class="relative w-full h-full bg-gray-800 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 p-[5%]">
      @for(board of boards(); track board.id){
        <div
            (click)="goToBoard(board.id)"
            class="bg-gray-700 flex flex-col overflow-hidden justify-around items-left rationale-regular p-6 rounded-xl aspect-3/2 cursor-pointer hover:bg-gray-600 duration-300" style="container-type: inline-size;">
            <h2 style="font-size: 15cqi;" class="text-white text-xl font-bold mb-2">{{ board.name }}</h2>
            <p style="font-size: 8cqi;" class="text-gray-400">Code: {{ board.code }}</p>
          </div>
      }
    </div>

   </div>
  `
})
export class Dashboard implements OnInit{
  boards=signal<Board[]>([]);
  newBoardName="";
  joinCode="";
  constructor(private api: ApiService, private auth: AuthService, private router: Router){}
  ngOnInit(){
    this.loadBoards();
  }
  loadBoards(){
    this.api.getBoards().subscribe(boards=>this.boards.set(boards));
  }
  createBoard(){
    if(!this.newBoardName.trim()) return;
    this.api.createBoards(this.newBoardName).subscribe(board=>{
      this.boards.update(boards=>[...boards, board]);
      this.newBoardName="";
    });
  }
  goToBoard(id: number){
    this.router.navigate(["/board/", id]);
  }
  joinBoard(){
    if(!this.joinCode.trim()) return;
    this.api.joinBoard(this.joinCode).subscribe(board=>{
      this.boards.update(boards=>[...boards, board]);
      this.joinCode="";
    });
  }
  logout(){
    this.auth.logout();
  }

}