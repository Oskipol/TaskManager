import { Injectable, signal } from '@angular/core';
import { Task } from '../models/task.model';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ApiService } from './api';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class BoardStoreService {
  tasks=signal<Task[]>([]);
  members=signal<string[]>([]);
  Leader=signal<string>("");
  isLeader=signal<boolean>(false);
  owner=signal<string>("");
  currentUser=signal<string>("");
  isOwner = signal<boolean>(false);
  private connection: HubConnection |null=null;
  constructor(private api: ApiService, private auth: AuthService){}
  loadBoard(boardId:number){
    this.api.getTasks(boardId).subscribe(tasks=>this.tasks.set(tasks));
    this.api.getMembers(boardId).subscribe(members=>this.members.set(members));
    this.api.getOwner(boardId).subscribe(owner=>{
      this.owner.set(owner);
      const currentUser = this.auth.currentUser();
    if (currentUser && currentUser.username == this.owner()) {
      this.isOwner.set(true);
    }
    else this.isOwner.set(false);
    });
    this.api.getLeader(boardId).subscribe(leader=>{
      this.Leader.set(leader);
       const currentUser = this.auth.currentUser();
    if (currentUser && currentUser.username == this.Leader()) {
      this.isLeader.set(true);
    }
    else this.isLeader.set(false);
    });
    this.currentUser.set(this.auth.currentUser()?.username??"");
    
    this.connectSignalR(boardId);
  }
  private connectSignalR(boardId: number){
    this.connection=new HubConnectionBuilder().withUrl("http://192.168.0.25:5294/taskHub", {
      accessTokenFactory: ()=>this.auth.getToken()??""
    }).withAutomaticReconnect().build();
    this.connection.on("taskCreated", (task: Task)=>{
      this.tasks.update(tasks=>[...tasks, task]);
    });
    this.connection.on("taskUpdated", (task:Task)=>{
      this.tasks.update(tasks=>tasks.map(t=>t.id==task.id?task:t));
    });
    this.connection.start().then(()=>{
      this.connection!.invoke("JoinBoard", boardId.toString());
    });
  }
  disconnect(){
    this.connection?.stop();
  }
  createTask(title: string, assignee: string, desc: string, boardId: number){
    this.api.createTask(title, assignee, desc, boardId).subscribe();
  }
  updateTask(task: Task){
    this.api.updateTask(task).subscribe();
  }
}
