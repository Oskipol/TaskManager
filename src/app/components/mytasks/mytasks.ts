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
  dajDate(task: Task){
    let dueTime=new Date(String(task.dueDate));
    let teraz =new Date();
    let timeDif=dueTime.getTime()-teraz.getTime();
    let ms=24*60*60*1000;
    if(timeDif>ms*365){return `${Math.floor(timeDif/(ms*365))} years and ${Math.floor(timeDif/ms)} days`}
    else if(timeDif>ms){return `${Math.floor(timeDif/ms)} days and ${Math.floor((timeDif-(Math.floor(timeDif/ms)*ms))/(ms/24))} hours`}
    else if(timeDif>(ms/24)){return `1 hour and ${Math.floor((timeDif-(1000*60*60))/(ms/(24*60)))} minutes`}
    else return null;
  }

}
