import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MarkdownService } from 'ngx-markdown';
import { IssueNode } from 'src/app/models/node';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-node-tree-detail-dialog',
  templateUrl: './node-tree-detail-dialog.component.html',
  styleUrls: ['./node-tree-detail-dialog.component.scss']
})
export class NodeTreeDetailDialogComponent {
  public node: IssueNode
  description: string

  dialogRef = inject(MatDialogRef<NodeTreeDetailDialogComponent>)
  dialogService = inject(DialogService)

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
