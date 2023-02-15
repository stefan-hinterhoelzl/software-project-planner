import { Component, Inject, inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-are-you-sure-dialog',
  templateUrl: './are-you-sure-dialog.component.html',
  styleUrls: ['./are-you-sure-dialog.component.scss']
})
export class AreYouSureDialogComponent {

  title: string;
  content: string;
  button1: string;
  button2: string;
  dialogRef = inject(MatDialogRef<AreYouSureDialogComponent>)

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.title = data.title;
    this.content = data.content;
    this.button1 = data.button1;
    this.button2 = data.button2;
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(true);
  }
}