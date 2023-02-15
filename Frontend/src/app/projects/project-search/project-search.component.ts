import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Project } from 'src/app/models/project';
import { DataService } from 'src/app/services/data.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AreYouSureDialogComponent } from 'src/app/dialogs/are-you-sure-dialog/are-you-sure-dialog.component';
import { take } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';

@Component({
  selector: 'app-project-search',
  templateUrl: './project-search.component.html',
  styleUrls: ['./project-search.component.scss'],
})
export class ProjectSearchComponent implements OnInit {
  data = inject(DataService);
  dialog = inject(MatDialog);
  firestore = inject(FirestoreService);
  snackbar = inject(SnackbarComponent);

  @Output() navigationEvent = new EventEmitter<string>();

  projects: Project[] = [];

  ngOnInit(): void {
    this.data.projects.subscribe((value) => {
      this.projects = value;
    });
  }

  navigate(value: string): void {
    this.navigationEvent.next(value);
  }

  toggleFavourite(projectid: string, boolean: boolean) {
    this.firestore
      .toggleProjectFavourite(boolean, projectid)
      .then(() => {
        if (boolean) this.snackbar.openSnackBar('Project added to favourites!.', 'green-snackbar');
        else this.snackbar.openSnackBar('Project removed from favourites', 'green-snackbar');
      })
      .catch((error) => {
        this.snackbar.openSnackBar(
          'An error occured',
          'red-snackbar'
        );
      });
  }

  deleteProject(project: Project) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '30%';
    dialogConfig.minWidth = '30%';

    dialogConfig.data = {
      title: 'Delete Project?',
      content: `Are you sure you want to delete the project \"${project.name}\"? It can not be restored.`,
      button1: 'Delete',
      button2: 'Cancel',
    };

    const dialogRef = this.dialog.open(AreYouSureDialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((data: boolean) => {
        if (data) {
          this.firestore
            .deleteProject(project.uid)
            .then(() => {
              this.snackbar.openSnackBar('Project deleted.', 'green-snackbar');
            })
            .catch((error) => {
              this.snackbar.openSnackBar(
                'Project deletion failed.',
                'red-snackbar'
              );
            });
        }
      });
  }
}