import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectItemViewComponent } from './project-item-view.component';

describe('ProjectItemViewComponent', () => {
  let component: ProjectItemViewComponent;
  let fixture: ComponentFixture<ProjectItemViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectItemViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectItemViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
