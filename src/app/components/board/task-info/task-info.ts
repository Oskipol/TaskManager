import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Task } from '../../../models/task.model';
import { BoardStoreService } from '../../../services/board-store';

@Component({
  selector: 'app-task-info',
  imports: [],
  templateUrl: './task-info.html',
  styles: ``,
})
export class TaskInfo {
  @Input() selectedTask!: Task|null;
  @Output() closed = new EventEmitter<void>();
  constructor(private store: BoardStoreService){}

    UpdateTask(){
    }
}
