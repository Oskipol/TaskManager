import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BoardStoreService } from '../../services/board-store';
import { Task } from '../../models/task.model';
import { Router, RouterLink } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {AddTask} from './add-task/add-task';
import { TaskInfo } from './task-info/task-info';
import { Settings } from './settings/settings';


@Component({
  selector: 'app-board',
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule, AddTask, TaskInfo, Settings],
  template: `
    <div class="w-full h-full inset-0 min-h-screen bg-gray-800">
      <div
        style="container-type: inline-size;"
        class="fixed top-0 z-10 left-0 bg-gray-900 h-[10vh] min-h-15 w-full flex justify-between items-center px-[2%]"
      >
        <h1 style="font-size: 5cqi;" class="rationale-regular font-bold text-white">
          Your Board Tasks
        </h1>
        <div class="flex gap-5">
          <button
            (click)="CreateTaskMode.set(true)"
            class="bg-green-500 flex justify-center items-center hover:bg-green-700 text-white font-bold py-2 px-4 cursor-pointer duration-300 rounded"
          >
            <button class="cursor-pointer hidden md:block">Add Task</button>
            <div class="h-full aspect-square bg-[url('/plus.png')] bg-cover bg-center block md:hidden"></div>
          </button>
          <button
            routerLink="/dashboard"
            class="bg-blue-500 flex justify-center items-center hover:bg-blue-700 text-white font-bold py-2 px-4 cursor-pointer duration-300 rounded"
          >
            <button class="cursor-pointer hidden md:block">Back</button>
            <div class="h-full aspect-square bg-[url('/arrow.png')] bg-cover bg-center block md:hidden"></div>
          </button>
          <div class="w-10 aspect-square flex justify-center items-center cursor-pointer" (click)="SettingsMode.set(true)" style="background-image: url('/gear.png'); background-size: cover; background-position: center;"><div class="w-[40%] h-[40%] rounded-[50%] bg-gray-700"></div></div>
        </div>
      </div>

      <div class="w-full mt-[10vh] bg-gray-800 relative">
          @if(SettingsMode()){
            <app-settings [store]="store" [members]="members()" [BoardId]="boardId" (closed)="SettingsMode.set(false)"></app-settings>
          }
        @if(TaskInfoMode()){
          <app-task-info [selectedTask]="selectedTask()" [BoardId]="boardId" [members]="members()" (closed)="TaskInfoMode.set(false)"></app-task-info>
        }
        @if (CreateTaskMode()&&(store.isLeader()||store.isOwner()||store.isSupervisor())) {
          <app-add-task [members]="members()" [boardId]="boardId()" (closed)="CreateTaskMode.set(false)"></app-add-task>
        }
        <div class="p-6">
          <h3 class="text-white text-2xl font-bold rationale-regular">Free Tasks:</h3>
          <div
            class="flex relative overflow-x-scroll min-h-[10vh] gap-4"
            (dragover)="onDragOver($event)"
            (drop)="onDropFree($event)"
          >
            @for (task of tasks(); track $index) {
              @if (task.assignedTo == '') {
                <div
                  (click)="TaskInfo(task)"
                  style="container-type: inline-size;"
                  class="bg-gray-600 overflow-hidden aspect-5/3 min-w-[50%] md:min-w-[40%] lg:min-w-[30%]  p-4 rounded-lg cursor-grab"
                  draggable="true"
                  (dragstart)="onDragStart($event, task)"
                >
                  <h4
                    style="font-size: 20cqi;"
                    class="text-white text-lg font-bold rationale-regular"
                  >
                    {{ task.title }}
                  </h4>
                  <p style="font-size: 10cqi;" class="text-gray-300">{{ task.description }}</p>
                </div>
              }
            }
          </div>
          <div class="w-full mt-[5%] h-full relative">
            @for (member of members(); track $index) {
              <div
                style="container-type: inline-size;"
                class="w-full flex gap-5 min-h-[10vh] overflow-x-scroll items-center p-4 mb-4 bg-gray-600 rounded-lg"
                (dragover)="onDragOver($event)"
                (drop)="onDrop($event, member)"
              >
                <div class="min-w-[20vw] max-w-[35vw] inline-block">
                  <p
                  style="font-size: 5cqi;"
                  class="rationale-regular wrap-break-word  text-center font-bold"
                  [ngClass]="member === store.owner().toString() ? 'text-amber-500' : store.Leaders().includes(member) ? 'text-red-700' : store.Supervisors().includes(member) ? 'text-green-500' : 'text-white'"
                >
                  {{ member }}
                </p>
                <p class="text-white text-center" style="font-size: 2.5cqi;">Points: {{ store.Points()[member] }}</p>
                </div>

                @for (task of tasks(); track $index) {
                  @if (task.assignedTo == member) {
                    <div
                      (click)="TaskInfo(task)"
                      style="container-type: inline-size;"
                      [ngClass]="task.status=='todo'?'bg-red-500':task.status=='in-progress'?'bg-gray-700':'bg-green-500'"
                      class="min-w-[50%] overflow-hidden aspect-5/3 md:min-w-[30%] lg:min-w-[20%] p-4 rounded-lg cursor-grab"
                      draggable="true"
                      (dragstart)="onDragStart($event, task)"
                    >
                      <h4
                        style="font-size: 20cqi;"
                        class="text-white text-lg font-bold rationale-regular"
                      >
                        {{ task.title }}
                      </h4>
                      <p style="font-size: 10cqi;" class="text-gray-300">{{ task.description }}</p>
                    </div>
                  }
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Board implements OnInit, OnDestroy {
  SettingsMode = signal<boolean>(false);
  tasks = signal<Task[]>([]);
  members = signal<string[]>([]);
  CreateTaskMode = signal<boolean>(false);
  TaskInfoMode = signal<boolean>(false);
  selectedTask = signal<Task | null>(null);
  boardId = signal<number>(0);
  constructor(
    public store: BoardStoreService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}
  ngOnInit() {
    this.boardId.set(Number(this.route.snapshot.paramMap.get('id')));
    this.store.loadBoard(this.boardId());
    this.tasks = this.store.tasks;
    this.members = this.store.members;
  }
  ngOnDestroy() {
    this.store.disconnect();
  }
  draggedTask: Task | null = null;
  
  TaskInfo(task: Task){
    this.TaskInfoMode.set(true);
    this.selectedTask.set(task);
  }
  onDragStart(event: DragEvent, task: Task) {
    this.draggedTask = task;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

 canDrop(targetMember: string): boolean {
  const currentUser = this.store.currentUser();
  if (this.store.isOwner()) return true;
  if (this.draggedTask?.status == "done" || this.draggedTask?.status == "in-progress") return false;

  const draggedFrom = this.draggedTask?.assignedTo ?? '';

  const isProtected = (user: string) =>
    user === this.store.owner().toString() ||
    (this.store.Leaders().includes(user) && user !== currentUser) ||
    (this.store.Supervisors().includes(user) && user !== currentUser);

  const isLeaderProtected = (user: string) =>
    user === this.store.owner().toString() ||
    (this.store.Leaders().includes(user) && user !== currentUser);

  if (this.store.isLeader()) {
    if (isLeaderProtected(targetMember)) return false;
    if (draggedFrom !== '' && isLeaderProtected(draggedFrom)) return false;
    return true;
  }

  if (this.store.isSupervisor()) {
    if (isProtected(targetMember)) return false;
    if (draggedFrom !== '' && isProtected(draggedFrom)) return false;
    return true;
  }

  if (draggedFrom !== '') return false;
  return targetMember === currentUser;
}

onDropFree(event: DragEvent) {
  event.preventDefault();
  if (!this.draggedTask) return;
  const currentUser = this.store.currentUser();
  if (this.draggedTask.status == "done" || this.draggedTask.status == "in-progress") return;

  if (this.store.isOwner()) {
    this.store.updateTask({ ...this.draggedTask, assignedTo: '' });
    this.draggedTask = null;
    return;
  }

  const draggedFrom = this.draggedTask.assignedTo ?? '';

  const isLeaderProtected = (user: string) =>
    user === this.store.owner().toString() ||
    (this.store.Leaders().includes(user) && user !== currentUser);

  const isProtected = (user: string) =>
    isLeaderProtected(user) ||
    (this.store.Supervisors().includes(user) && user !== currentUser);

  if (this.store.isLeader()) {
    if (isLeaderProtected(draggedFrom)) return;
    this.store.updateTask({ ...this.draggedTask, assignedTo: '' });
    this.draggedTask = null;
    return;
  }

  if (this.store.isSupervisor()) {
    if (isProtected(draggedFrom)) return;
    this.store.updateTask({ ...this.draggedTask, assignedTo: '' });
    this.draggedTask = null;
    return;
  }

  if (draggedFrom !== currentUser) return;
  this.store.updateTask({ ...this.draggedTask, assignedTo: '' });
  this.draggedTask = null;
}
  onDrop(event: DragEvent, targetMember: string) {
    console.log(this.draggedTask?.points);
    event.preventDefault();
    if (!this.draggedTask) return;
    if (!this.canDrop(targetMember)) return;

    this.store.updateTask({ ...this.draggedTask, assignedTo: targetMember });
    this.draggedTask = null;
  }
}
