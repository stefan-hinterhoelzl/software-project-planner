import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IssueNode } from 'src/app/models/node';

@Component({
  selector: 'app-node-tree-detail-dialog',
  templateUrl: './node-tree-detail-dialog.component.html',
  styleUrls: ['./node-tree-detail-dialog.component.scss']
})
export class NodeTreeDetailDialogComponent {
  public node: IssueNode

  dialogRef = inject(MatDialogRef<NodeTreeDetailDialogComponent>)

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
