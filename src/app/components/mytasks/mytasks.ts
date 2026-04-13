import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Task } from '../../models/task.model';


@Component({
  selector: 'app-mytasks',
  imports: [RouterLink],
  templateUrl: './mytasks.html',
  styles: ``,
})
export class Mytasks implements OnInit {
  constructor(private api: ApiService) {}
  tasks=signal<Task[]>([]);
  user=JSON.parse(localStorage.getItem("user") ?? "{}");
  ngOnInit(): void {
    this.api.getUserTasks(this.user.username).subscribe(tasks => {
      this.tasks.set(tasks);
    });
  }

}
