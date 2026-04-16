import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Task } from '../../models/task.model';
import { NgClass } from "@angular/common";


@Component({
  selector: 'app-mytasks',
  imports: [RouterLink, NgClass],
  templateUrl: './mytasks.html',
  styles: ``,
})
export class Mytasks implements OnInit {
  boards: any[] = [];
  constructor(private api: ApiService) {}
  tasks=signal<Task[]>([]);
  user=JSON.parse(localStorage.getItem("user") ?? "{}");
  ngOnInit(): void {
  this.api.getBoards().subscribe(boards => {
    this.boards = boards;
  });
  this.api.getUserTasks(this.user.username).subscribe(tasks => {
    const sorted = tasks.sort((a, b) => {
      const dateA = new Date(a.dueDate ?? '').getTime();
      const dateB = new Date(b.dueDate ?? '').getTime();
      return dateA - dateB;
    });
    this.tasks.set(sorted);
  });
}
  giveDate(task: Task):string|null{
    let dueTime=new Date(String(task?.dueDate));
    let teraz =new Date();
    let timeDif=dueTime.getTime()-teraz.getTime();
    let ms=24*60*60*1000;
    if(timeDif>ms*365){return `${Math.floor(timeDif/(ms*365))} years and ${Math.floor(timeDif/ms)} days`}
    else if(timeDif>ms){return `${Math.floor(timeDif/ms)} days and ${Math.floor((timeDif-(Math.floor(timeDif/ms)*ms))/(ms/24))} hours`}
    else if(timeDif>(ms/24)){return `${Math.floor(timeDif/(ms/24))} hours and ${Math.floor((timeDif-(Math.floor(timeDif/(ms/24))*(ms/24)))/(1000*60))} minutes`}
    else if(timeDif>0){return `${Math.floor(timeDif/(1000*60))} minutes`}
    else return null;
  }
  giveBoard(task: Task){
    const board = this.boards.find(b => b.id == task.boardId);
    if (board) {
      return board.name;
    }
    else return "No idea";
  }

}
