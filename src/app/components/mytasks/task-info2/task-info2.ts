import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Task } from '../../../models/task.model';
import { FormsModule } from '@angular/forms';
import { BoardStoreService } from '../../../services/board-store';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-task-info2',
  imports: [FormsModule],
  templateUrl: './task-info2.html',
  styles: ``,
})
export class TaskInfo2 implements OnInit {
  @Input() selectedTask: Task | null = null;
  @Output() closed = new EventEmitter<void>();
  title = '';
  description = '';
  note='';
  assignee = '';
  status: Task['status'] | '' = '';
  points=0;
  dueDate: Date | null = null;
  createdBy = '';
  constructor(public store: BoardStoreService, private snackBar: MatSnackBar){}
  ngOnInit(): void {
    if(this.selectedTask){
      this.title=this.selectedTask.title;
      this.description=this.selectedTask.description;
      this.note=this.selectedTask.note ?? '';
      this.assignee = this.selectedTask.assignedTo ?? '';
      this.status = this.selectedTask.status;
      this.points=this.selectedTask.points;
      this.dueDate = this.selectedTask.dueDate ? new Date(this.selectedTask.dueDate) : null;
      this.createdBy = this.selectedTask.createdBy;
    }
  }
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
