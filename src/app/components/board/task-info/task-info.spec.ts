import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskInfo } from './task-info';

describe('TaskInfo', () => {
  let component: TaskInfo;
  let fixture: ComponentFixture<TaskInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
