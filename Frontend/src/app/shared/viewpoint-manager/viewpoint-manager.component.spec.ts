import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewpointManagerComponent } from './viewpoint-manager.component';

describe('ViewpointManagerComponent', () => {
  let component: ViewpointManagerComponent;
  let fixture: ComponentFixture<ViewpointManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ViewpointManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewpointManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
