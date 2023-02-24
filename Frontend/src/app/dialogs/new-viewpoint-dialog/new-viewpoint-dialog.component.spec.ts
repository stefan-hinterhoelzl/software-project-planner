import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewViewpointDialogComponent } from './new-viewpoint-dialog.component';

describe('NewViewpointDialogComponent', () => {
  let component: NewViewpointDialogComponent;
  let fixture: ComponentFixture<NewViewpointDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewViewpointDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewViewpointDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
