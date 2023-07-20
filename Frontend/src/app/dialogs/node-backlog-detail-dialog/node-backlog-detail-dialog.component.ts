import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IssueNode } from 'src/app/models/node';

@Component({
  selector: 'app-node-backlog-detail-dialog',
  templateUrl: './node-backlog-detail-dialog.component.html',
  styleUrls: ['./node-backlog-detail-dialog.component.scss']
})
export class NodeBacklogDetailDialogComponent {
  public node: IssueNode

  dialogRef = inject(MatDialogRef<NodeBacklogDetailDialogComponent>)

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.node = data.node;
  }

  close() {
    this.dialogRef.close();
  }

   onKeydownEvent(event: any) {
     if (event.keyCode === 27) this.close();
   }

}
