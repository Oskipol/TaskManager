import { Injectable, signal } from '@angular/core';
import { Task } from '../models/task.model';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ApiService } from './api';
import { AuthService } from './auth';
import { Board } from '../components/board/board';

@Injectable({
  providedIn: 'root',
})
export class BoardStoreService {
  tasks=signal<Task[]>([]);
  members=signal<string[]>([]);
  Leaders=signal<string[]>([]);
  isLeader=signal<boolean>(false);
  owner=signal<string>("");
  Name=signal<string>("");
  Code=signal<string>("");
  Supervisors=signal<string[]>([]);
  Points = signal<{[key: string]: number}>({});
  isSupervisor=signal<boolean>(false);
  currentUser=signal<string>("");
  isOwner = signal<boolean>(false);
  private connection: HubConnection|null=null;
  constructor(private api: ApiService, private auth: AuthService){}
  loadBoard(boardId:number){
    this.api.getBoards().subscribe(boards=>{
      const board = boards.find(b => b.id === boardId);
      if (board) {
        this.Name.set(board.name);
        this.Code.set(board.code);
      }
    })
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
    this.api.getLeaders(boardId).subscribe(leaders => {
  this.Leaders.set(leaders);
  const currentUser = this.auth.currentUser();
  if (currentUser && leaders.includes(currentUser.username)) {
    this.isLeader.set(true);
  } else {
    this.isLeader.set(false);
  }
});

this.api.getSupervisors(boardId).subscribe(supervisors => {
  this.Supervisors.set(supervisors);
  const currentUser = this.auth.currentUser();
  if (currentUser && supervisors.includes(currentUser.username)) {
    this.isSupervisor.set(true);
  } else {
    this.isSupervisor.set(false);
  }
});

    this.currentUser.set(this.auth.currentUser()?.username??"");
    this.api.getPoints(boardId).subscribe(points => this.Points.set(points));
    this.connectSignalR(boardId);
  }
  private connectSignalR(boardId: number){
    this.connection=new HubConnectionBuilder().withUrl("http://192.168.0.25:5294/taskHub", {
      accessTokenFactory: ()=>this.auth.getToken()??""
    }).withAutomaticReconnect().build();
    this.connection.on("taskCreated", (task: Task)=>{
      this.tasks.update(tasks=>[...tasks, task]);
    });
    this.connection.on("TaskDeleted", (id: number) => {
  this.tasks.update(tasks => tasks.filter(t => t.id !== id));
});
    this.connection.on("RoleChanged", (leaders: string[], supervisors: string[]) => {
  this.Leaders.set(leaders);
  this.Supervisors.set(supervisors);
  const currentUser = this.auth.currentUser();
  if (currentUser) {
    this.isLeader.set(leaders.includes(currentUser.username));
    this.isSupervisor.set(supervisors.includes(currentUser.username));
  }
});

this.connection.on("PointsUpdated", (points: {[key: string]: number}) => {
  this.Points.set(points);
});
    this.connection.on("taskUpdated", (task:Task)=>{
      this.tasks.update(tasks=>tasks.map(t=>t.id==task.id?task:t));
    });
    this.connection.start().then(()=>{
      this.connection!.invoke("JoinBoard", boardId.toString());
    });
  }
  changeRole(boardId: number, username: string, role: string){
    this.api.changeRole(boardId, username, role).subscribe();
  }
  disconnect(){
    this.connection?.stop();
  }
  createTask(title: string, assignee: string, desc: string, boardId: number, points: number){
    this.api.createTask(title, assignee, desc, boardId, points).subscribe();
  }
  updateTask(task: Task){
    this.api.updateTask(task).subscribe();
  }
  setPoints(boardId: number, username: string, points: number){
    this.api.setPoints(boardId, username, points).subscribe();
  }
  deleteTask(id: number, boardId: number){
    this.api.deleteTask(id, boardId).subscribe();
  }
}
