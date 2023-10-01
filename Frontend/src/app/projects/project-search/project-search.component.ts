import { Component, EventEmitter, inject, Output } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { MatDialog } from '@angular/material/dialog';
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
