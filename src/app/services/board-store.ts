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
  private connection: HubConnection |null=null;
  constructor(private api: ApiService, private auth: AuthService){}
  loadBoard(boardId:number){
    this.api.getTasks(boardId).subscribe(tasks=>this.tasks.set(tasks));
    this.connectSignalR(boardId);
  }
  private connectSignalR(boardId: number){
    this.connection=new HubConnectionBuilder().withUrl("http://localhost:5294/taskHub", {
      accessTokenFactory: ()=>this.auth.getToken()??""
    }).withAutomaticReconnect().build();
    this.connection.on("taskCreated", (task: Task)=>{
      this.tasks.update(tasks=>[...tasks, task]);
    });
    this.connection.on("taskUpdated", (task:Task)=>{
      this.tasks.update(tasks=>tasks.map(t=>t.id==task.id?task:t));
    })
    this.connection.start().then(()=>{
      this.connection!.invoke("JoinBoard", boardId.toString());
    });
  }
  disconnect(){
    this.connection?.stop();
  }
  createTask(title: string, desc: string, boardId: number){
    this.api.createTask(title, desc, boardId).subscribe();
  }
  updateTask(task: Task){
    this.api.updateTask(task).subscribe();
  }
}
