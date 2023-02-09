import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueDetailDialogComponent } from './issue-detail-dialog.component';

describe('IssueDetailDialogComponent', () => {
  let component: IssueDetailDialogComponent;
  let fixture: ComponentFixture<IssueDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IssueDetailDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssueDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
