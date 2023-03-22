import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Project } from 'src/app/models/project';
import { DataService } from 'src/app/services/data.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AreYouSureDialogComponent } from 'src/app/dialogs/are-you-sure-dialog/are-you-sure-dialog.component';
import { take } from 'rxjs';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';

@Component({
  selector: 'app-project-search',
  templateUrl: './project-search.component.html',
  styleUrls: ['./project-search.component.scss'],
})
export class ProjectSearchComponent {
  data = inject(DataService);
  dialog = inject(MatDialog);
  snackbar = inject(SnackbarComponent);

  @Output() navigationEvent = new EventEmitter<string>();

  projects$ = this.data.projects$;

  navigate(value: string): void {
    this.navigationEvent.next(value);
  }

}
