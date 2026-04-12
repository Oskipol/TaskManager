import { Component, Output, EventEmitter } from '@angular/core';
import { BoardStoreService } from '../../../services/board-store';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styles: ``,
})
export class Settings {

  @Output() closed=new EventEmitter<void>();
  user = JSON.parse(localStorage.getItem("user") ?? "{}");
  username=this.user.username;
  email=this.user.email;
}
