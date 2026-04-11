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


@Component({
  selector: 'app-board',
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule, AddTask, TaskInfo],
  template: `
    <div class="w-full h-full inset-0 bg-gray-900 min-h-screen">
      <div
        style="container-type: inline-size;"
        class="relative top-0 left-0 h-[10%] min-h-15 w-full flex justify-between items-center px-[2%]"
      >
        <h1 style="font-size: 5cqi;" class="rationale-regular font-bold text-white">
          Your Board Tasks
        </h1>
        <div class="flex gap-5">
          <button
            (click)="CreateTaskMode.set(true)"
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 cursor-pointer duration-300 rounded"
          >
            Add Task
          </button>
          <button
            routerLink="/dashboard"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 cursor-pointer duration-300 rounded"
          >
            Back
          </button>
          <div class="w-10 aspect-square cursor-pointer" style="background-image: url('setting.png'); background-size: cover; background-position: center;"></div>
        </div>
      </div>
      <div></div>
      <div class="w-full bg-gray-800 relative">
        @if(TaskInfoMode()){
          <app-task-info [selectedTask]="selectedTask()" [members]="members()" (closed)="TaskInfoMode.set(false)"></app-task-info>
        }
        @if (CreateTaskMode()) {
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
                <p
                  style="font-size: 8cqi;"
                  class="rationale-regular"
                  [ngClass]="member === store.owner().toString() ? 'text-amber-500' : store.Leader() === member ? 'text-green-500' : 'text-white'"
                >
                  {{ member }}
                </p>

                @for (task of tasks(); track $index) {
                  @if (task.assignedTo == member) {
                    <div
                      (click)="TaskInfo(task)"
                      style="container-type: inline-size;"
                      [ngClass]="task.status=='todo'?'bg-red-500':task.status=='in-progress'?'bg-gray-700':'bg-green-500'"
                      class="min-w-[40%] overflow-hidden aspect-5/3 md:min-w-[30%] lg:min-w-[20%] p-4 rounded-lg cursor-grab"
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
    if (this.draggedTask?.assignedTo !== '') return false; 
    if(this.draggedTask?.status=="done"||this.draggedTask?.status=="in-progress") return false;

    return targetMember === currentUser;
  }

  onDrop(event: DragEvent, targetMember: string) {
    event.preventDefault();
    if (!this.draggedTask) return;
    if (!this.canDrop(targetMember)) return;

    this.store.updateTask({ ...this.draggedTask, assignedTo: targetMember });
    this.draggedTask = null;
  }

  onDropFree(event: DragEvent) {
    event.preventDefault();
    if (!this.draggedTask) return;
    if (!this.store.isOwner() && this.draggedTask.assignedTo !== this.store.currentUser()) return;
    if(this.draggedTask.status=="done"||this.draggedTask.status=="in-progress") return;
    this.store.updateTask({ ...this.draggedTask, assignedTo: '' });
    this.draggedTask = null;
  }
}
