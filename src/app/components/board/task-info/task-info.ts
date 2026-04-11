import { Component, Input, EventEmitter, Output, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
  @Output() closed = new EventEmitter<void>();
  UpdateTaskMode = signal<boolean>(false);
  title = '';
  description = '';
  note='';
  assignee = '';
  status: Task['status'] | '' = '';
  ngOnInit(){
    if(this.selectedTask){
      this.title=this.selectedTask.title;
      this.description=this.selectedTask.description;
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedTask'] && this.selectedTask) {
      this.title = this.selectedTask.title;
      this.description = this.selectedTask.description;
      this.note = this.selectedTask.Note ?? '';
      this.assignee = this.selectedTask.assignedTo ?? '';
      this.status = '';
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
        this.store.updateTask(this.selectedTask);
      }
      else if(this.selectedTask?.status=="in-progress"&&this.note.trim()==""){
        this.snackBar.open("Write completion note before finishing", "Close", {duration: 3000})
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
    UpdateTask(){
      if(this.status) {this.selectedTask!.status=this.status as Task['status']; this.status='';}
      this.selectedTask!.title=this.title;
      this.selectedTask!.description=this.description;
      this.selectedTask!.Note=this.note;
      this.selectedTask!.assignedTo=this.assignee;
      this.store.updateTask(this.selectedTask!);
    }
}
