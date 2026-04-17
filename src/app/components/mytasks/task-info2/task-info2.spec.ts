import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskInfo2 } from './task-info2';

describe('TaskInfo2', () => {
  let component: TaskInfo2;
  let fixture: ComponentFixture<TaskInfo2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskInfo2],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskInfo2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
