import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectItemOptionsComponent } from './project-item-options.component';

describe('ProjectItemOptionsComponent', () => {
  let component: ProjectItemOptionsComponent;
  let fixture: ComponentFixture<ProjectItemOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectItemOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectItemOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
