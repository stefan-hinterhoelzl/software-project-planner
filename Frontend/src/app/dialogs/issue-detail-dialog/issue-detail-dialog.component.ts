import { Component, Inject, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MarkdownService } from 'ngx-markdown';
import { ALMIssue } from 'src/app/models/alm.models';

@Component({
  selector: 'app-issue-detail-dialog',
  templateUrl: './issue-detail-dialog.component.html',
  styleUrls: ['./issue-detail-dialog.component.scss']
})
export class IssueDetailDialogComponent {

  public issue: ALMIssue
  description: string

  dialogRef = inject(MatDialogRef<IssueDetailDialogComponent>)
  markdownservice = inject(MarkdownService)

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.issue = data.issue;
    this.description = this.markdownservice.parse(this.issue.description)

  }

  close(bool: boolean) {
    this.dialogRef.close(bool);
  }

  onKeydownEvent(event: any) {
    if (event.keyCode === 27) this.close(false);
  }

}


