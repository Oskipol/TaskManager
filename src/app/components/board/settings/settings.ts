import { Component, Output, EventEmitter, Input, signal, Signal } from '@angular/core';
import { BoardStoreService } from '../../../services/board-store';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-settings',
  imports: [NgClass],
  templateUrl: './settings.html',
  styles: ``,
})
export class Settings{
  @Input() members: string[] = [];
  @Input() store!: BoardStoreService;
  @Input() BoardId!: Signal<number>;
  @Output() closed = new EventEmitter<void>();
  Roll=signal<boolean>(true);
  RoleAssignMode=signal<string>("");

  onRoleChange(member: string, event: Event) {
  const role = (event.target as HTMLSelectElement).value;
  this.store.changeRole(this.BoardId(), member, role);
}

}
