import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatButtonToggleModule, MatInputModule],
  selector: 'app-new-viewpoint-dialog',
  templateUrl: './new-viewpoint-dialog.component.html',
  styleUrls: ['./new-viewpoint-dialog.component.scss']
})
export class NewViewpointDialogComponent {

  dialogRef = inject(MatDialogRef<NewViewpointDialogComponent>)
  fb = inject(FormBuilder)

  viewPointTitle = this.fb.group({
    title: ['', Validators.required],
  });

  save() {
    if (this.viewPointTitle.valid) {
      this.dialogRef.close(this.viewPointTitle.get("title")?.value)
    }

  }

  close() {
    this.dialogRef.close()
  }

  onKeydownEvent(event: any) {
    if (event.keyCode === 27) this.close();
  }


}
