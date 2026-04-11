import { Component, Output, Input, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BoardStoreService } from '../../../services/board-store';

@Component({
  selector: 'app-add-task',
  imports: [FormsModule],
  templateUrl: './add-task.html',
  styles: ``,
})
export class AddTask {
  @Input() members: string[]=[];
  @Input() boardId!: number;

  @Output() closed=new EventEmitter<void>();

  title='';
  description='';
  assignee='';

  constructor(public store: BoardStoreService){}
  CreateTask(){
    if(this.title.trim() === '') return;
    this.store.createTask(this.title, this.assignee, this.description, this.boardId);
    this.closed.emit();
  }
}
