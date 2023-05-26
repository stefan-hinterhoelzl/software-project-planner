import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeTreeDetailDialogComponent } from './node-tree-detail-dialog.component';

describe('NodeTreeDetailDialogComponent', () => {
  let component: NodeTreeDetailDialogComponent;
  let fixture: ComponentFixture<NodeTreeDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodeTreeDetailDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NodeTreeDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
