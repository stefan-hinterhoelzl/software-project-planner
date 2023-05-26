import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeBacklogDetailDialogComponent } from './node-backlog-detail-dialog.component';

describe('NodeBacklogDetailDialogComponent', () => {
  let component: NodeBacklogDetailDialogComponent;
  let fixture: ComponentFixture<NodeBacklogDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodeBacklogDetailDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeBacklogDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
