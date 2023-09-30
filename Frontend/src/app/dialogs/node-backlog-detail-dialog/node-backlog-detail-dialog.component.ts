import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MarkdownService } from 'ngx-markdown';
import { IssueNode } from 'src/app/models/node';

@Component({
  selector: 'app-node-backlog-detail-dialog',
  templateUrl: './node-backlog-detail-dialog.component.html',
  styleUrls: ['./node-backlog-detail-dialog.component.scss']
})
export class NodeBacklogDetailDialogComponent {
  public node: IssueNode
  description: string;

  dialogRef = inject(MatDialogRef<NodeBacklogDetailDialogComponent>)

  markdownservice = inject(MarkdownService)

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.node = data.node;

    this.description = this.markdownservice.parse(this.node.issue.description)
  }

  close() {
    this.dialogRef.close();
  }

   onKeydownEvent(event: any) {
     if (event.keyCode === 27) this.close();
   }

}
