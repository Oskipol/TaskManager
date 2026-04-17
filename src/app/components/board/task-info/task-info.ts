import { Component, Input, EventEmitter, Output, signal, Signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Task } from '../../../models/task.model';
import { BoardStoreService } from '../../../services/board-store';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-task-info',
  imports: [FormsModule, NgClass],
  templateUrl: './task-info.html',
  styles: ``,
})
export class TaskInfo implements OnInit, OnChanges {
  @Input() selectedTask!: Task|null;
  @Input() members: string[]=[];
  @Input() BoardId!: Signal<number>;
  @Output() closed = new EventEmitter<void>();
  UpdateTaskMode = signal<boolean>(false);
  title = '';
  description = '';
  note='';
  assignee = '';
  status: Task['status'] | '' = '';
  points=0;
  dueDate: Date | null = null;
  createdBy = '';
  ngOnInit(){
    if(this.selectedTask){
      this.title=this.selectedTask.title;
      this.description=this.selectedTask.description;
      this.note=this.selectedTask.note ?? '';
      this.points=this.selectedTask.points;
      this.dueDate = this.selectedTask.dueDate ? new Date(this.selectedTask.dueDate) : null;
      this.createdBy = this.selectedTask.createdBy;
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedTask'] && this.selectedTask) {
      this.title = this.selectedTask.title;
      this.description = this.selectedTask.description;
      this.note = this.selectedTask.note ?? '';
      this.assignee = this.selectedTask.assignedTo ?? '';
      this.status = '';
      this.points = this.selectedTask.points;
      this.dueDate = this.selectedTask.dueDate ? new Date(this.selectedTask.dueDate) : null;
      this.createdBy = this.selectedTask.createdBy;
    }
  }
  constructor(public store: BoardStoreService, private snackBar: MatSnackBar){}

    ChangeStatus(){
  if(this.selectedTask?.status=="todo"){
    this.selectedTask.status="in-progress";
    this.store.updateTask(this.selectedTask); 
  }
  else if(this.selectedTask?.status=="in-progress"&&this.note.trim()!=""){
    this.selectedTask.status="done";
    this.selectedTask.note = this.note; 
    this.store.updateTask(this.selectedTask);
  }
  else{
    this.snackBar.open("You must provide a note before marking the task as done", "Close", { duration: 3000 });
  }
}
      ReactivateTask(){
        if(this.selectedTask?.status=="done"){
          this.selectedTask.status="in-progress";
          this.store.updateTask(this.selectedTask);
        }
      }
      SurrenderTask(){
        if(this.selectedTask?.status=="in-progress"){
          this.selectedTask.status="todo";
          this.store.updateTask(this.selectedTask);
        }
       }
       DeleteTask(){
        this.store.setPoints(this.BoardId(), this.selectedTask?.assignedTo ?? '', this.selectedTask?.points ?? 0);
        this.store.deleteTask(this.selectedTask?.id ?? 0, this.BoardId());
        this.closed.emit();
       }
    UpdateTask() {
      
  const currentUser = this.store.currentUser();

  const isProtected = (user: string) =>
    user === this.store.owner().toString() ||
    (this.store.Leaders().includes(user) && user !== currentUser) ||
    (this.store.Supervisors().includes(user) && user !== currentUser);

  const isLeaderProtected = (user: string) =>
    user === this.store.owner().toString() ||
    (this.store.Leaders().includes(user) && user !== currentUser);

  if (!this.store.isOwner()) {
    
    if (this.store.isLeader()) {
      if (isLeaderProtected(this.selectedTask?.assignedTo ?? '')) {
        this.snackBar.open("You can't reassign this task", "Close", { duration: 3000 });
        return;
      }
      if (this.assignee !== '' && isLeaderProtected(this.assignee)) {
        this.snackBar.open("You can't assign to this user", "Close", { duration: 3000 });
        return;
      }
    } else if (this.store.isSupervisor()) {
      if (isProtected(this.selectedTask?.assignedTo ?? '')) {
        this.snackBar.open("You can't reassign this task", "Close", { duration: 3000 });
        return;
      }
      if (this.assignee !== '' && isProtected(this.assignee)) {
        this.snackBar.open("You can't assign to this user", "Close", { duration: 3000 });
        return;
      }
    } else {
      if (isProtected(this.selectedTask?.assignedTo ?? '')) {
        this.snackBar.open("You can't reassign this task", "Close", { duration: 3000 });
        return;
      }
      if (this.assignee !== '' && this.assignee !== currentUser) {
        this.snackBar.open("You can only assign to yourself", "Close", { duration: 3000 });
        return;
      }
    }
  }
  

  if (this.status) { this.selectedTask!.status = this.status as Task['status']; this.status = ''; }
  this.selectedTask!.title = this.title;
  this.selectedTask!.description = this.description;
  this.selectedTask!.note = this.note;
  this.selectedTask!.assignedTo = this.assignee;
  this.selectedTask!.points = this.points;
  this.selectedTask!.dueDate = this.dueDate;
  this.store.updateTask(this.selectedTask!);
}
giveDate():string|null{
    let dueTime=new Date(String(this.selectedTask?.dueDate));
    let teraz =new Date();
    let timeDif=dueTime.getTime()-teraz.getTime();
    let ms=24*60*60*1000;
    if(timeDif>ms*365){return `${Math.floor(timeDif/(ms*365))} years and ${Math.floor(timeDif/ms)} days`}
    else if(timeDif>ms){return `${Math.floor(timeDif/ms)} days and ${Math.floor((timeDif-(Math.floor(timeDif/ms)*ms))/(ms/24))} hours`}
    else if(timeDif>(ms/24)){return `${Math.floor(timeDif/(ms/24))} hours and ${Math.floor((timeDif-(Math.floor(timeDif/(ms/24))*(ms/24)))/(1000*60))} minutes`}
    else if(timeDif>0){return `${Math.floor(timeDif/(1000*60))} minutes`}
    else if(timeDif<=0){return "Task is overdue"}
    else return null;
  }
}
