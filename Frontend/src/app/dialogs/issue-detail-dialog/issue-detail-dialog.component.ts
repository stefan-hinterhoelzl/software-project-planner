import { Component, Inject, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-issue-detail-dialog',
  templateUrl: './issue-detail-dialog.component.html',
  styleUrls: ['./issue-detail-dialog.component.scss']
})
export class IssueDetailDialogComponent {

  public issue: any

  dialogRef = inject(MatDialogRef<IssueDetailDialogComponent>)

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.issue = data.issue;
  }

  close() {
    this.dialogRef.close();
  }

}


