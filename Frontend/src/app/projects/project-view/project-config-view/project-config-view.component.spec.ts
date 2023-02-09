import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectConfigViewComponent } from './project-config-view.component';

describe('ProjectConfigViewComponent', () => {
  let component: ProjectConfigViewComponent;
  let fixture: ComponentFixture<ProjectConfigViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectConfigViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectConfigViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
