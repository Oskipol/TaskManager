import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BoardStoreService } from '../../services/board-store';
import { Task } from '../../models/task.model';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-board',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="w-full h-full inset-0 bg-gray-900 min-h-screen">
      <div
        style="container-type: inline-size;"
        class="relative top-0 left-0 h-[10%] min-h-15 w-full flex justify-between items-center px-[5%]"
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
      <div class="w-full min-h-[90vh] bg-gray-800 relative">
        @if (CreateTaskMode()) {
          <div
            class="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center"
          >
            <div
              style="container-type: inline-size;"
              class="bg-gray-800 border-2 border-gray-500 hover:border-gray-400 duration-300 z-10 lg:w-[40%] md:w-[60%] w-[70%] p-6 rounded-lg flex flex-col gap-4"
            >
              <h2 class="text-white text-2xl font-bold rationale-regular">Create New Task</h2>
              <input
                [(ngModel)]="newTaskTitle"
                type="text"
                class="bg-gray-600 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task title"
              />
              <textarea
                [(ngModel)]="newTaskDescription"
                class="bg-gray-600 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task description"
              ></textarea>
              <select
                [(ngModel)]="newTaskAssignee"
                class="bg-gray-600 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled selected>Select Assignee</option>
                <option value="">Free</option>
                @for (member of members(); track $index) {
                  @if (store.isOwner()) {
                    <option [value]="member">{{ member }}</option>
                  } @else {
                    <option [value]="store.currentUser()">{{ store.currentUser() }}</option>
                  }
                }
              </select>
              <button
                (click)="CreateTask()"
                class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 cursor-pointer duration-300 rounded"
              >
                Create
              </button>
              <button
                (click)="CreateTaskMode.set(false)"
                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 cursor-pointer duration-300 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
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
                  style="container-type: inline-size;"
                  class="bg-gray-600 min-w-[20%] p-4 rounded-lg cursor-grab"
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
                class="w-full flex gap-5 min-h-[10vh] items-center p-4 mb-4 bg-gray-600 rounded-lg"
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
                      style="container-type: inline-size;"
                      class="bg-gray-700 min-w-[20%] p-4 rounded-lg cursor-grab"
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
  newTaskTitle = '';
  newTaskDescription = '';
  newTaskAssignee = '';
  members = signal<string[]>([]);
  CreateTaskMode = signal<boolean>(false);
  boardId = 0;
  constructor(
    public store: BoardStoreService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}
  ngOnInit() {
    this.boardId = Number(this.route.snapshot.paramMap.get('id'));
    this.store.loadBoard(this.boardId);
    this.tasks = this.store.tasks;
    this.members = this.store.members;
  }
  ngOnDestroy() {
    this.store.disconnect();
  }
  CreateTask() {
    if (!this.newTaskTitle.trim()) return;
    this.store.createTask(
      this.newTaskTitle,
      this.newTaskAssignee,
      this.newTaskDescription,
      this.boardId,
    );
    this.CreateTaskMode.set(false);
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.newTaskAssignee = '';
  }
  draggedTask: Task | null = null;

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

    this.store.updateTask({ ...this.draggedTask, assignedTo: '' });
    this.draggedTask = null;
  }
}
