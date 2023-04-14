import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable, combineLatest, of, share, shareReplay, startWith, switchMap, take, tap } from 'rxjs';
import { AreYouSureDialogComponent } from 'src/app/dialogs/are-you-sure-dialog/are-you-sure-dialog.component';
import { Project, RemoteProject, RemoteProjectDeleteObject } from 'src/app/models/project';
import { GitlabALMService } from 'src/app/services/ALM/Adapater Services/gitLab.service';
import { CanComponentDeactivate } from 'src/app/services/can-deactivate-guard.service';
import { DataService } from 'src/app/services/data.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';

@Component({
  selector: 'app-project-config-view',
  templateUrl: './project-config-view.component.html',
  styleUrls: ['./project-config-view.component.scss'],
})
export class ProjectConfigViewComponent implements CanComponentDeactivate {
  data = inject(DataService);
  fb = inject(FormBuilder);
  alm = inject(GitlabALMService);
  snackbar = inject(SnackbarComponent);
  dialog = inject(MatDialog);

  constructor() {
    this.projectsLoading = false;
    this.remoteIDHasError = false;
    this.hide = true;
    this.remoteProjectsMinus = [];
  }

  //Variables to restore to
  ALMInstancesSave!: RemoteProject[];
  project!: Project;

  projectDetails = this.fb.group({
    nameCtrl: ['', Validators.required],
    descrCtrl: ['', Validators.required],
  });

  ALMInstanceForm = this.fb.group({
    remoteID: ['', Validators.required],
    accessToken: ['', Validators.required],
  });

  project$ = this.data.activeProject$.pipe(
    tap(project => {
      if (project !== undefined) {
        this.project = project;
        this.projectDetails.get('nameCtrl')!.setValue(project.title);
        this.projectDetails.get('descrCtrl')!.setValue(project.description);
      }
    })
  );

  remoteProjects$ = this.data.remoteProjects$.pipe(
    tap(remoteProjects => {
      this.ALMInstancesSave = JSON.parse(JSON.stringify(remoteProjects));
    })
  );

  view$ = combineLatest([this.project$, this.remoteProjects$]).pipe(shareReplay(1));

  //State Booleans
  hide: boolean;
  projectsLoading: boolean;
  remoteIDHasError: boolean;

  //Delta Object
  remoteProjectsMinus: RemoteProjectDeleteObject[];

  canDeactivate(): Observable<boolean> | boolean {
    return this.view$.pipe(
      switchMap(value => {

        let changesInProjects: boolean = false;

        if (value[1].length !== this.ALMInstancesSave.length) changesInProjects = true;

        if (!changesInProjects) {
          value[1].forEach(value => {
            let project: RemoteProject | undefined = this.ALMInstancesSave.find(remoteP => {
              return  remoteP.remoteProjectId === value.remoteProjectId && remoteP.projectId === value.projectId && remoteP.accessToken === value.accessToken
            })

            if (project === undefined) changesInProjects = true;
          })
        }

        if (this.projectDetails.dirty || changesInProjects) {
          const dialogConfigKeep = new MatDialogConfig();

          dialogConfigKeep.data = {
            title: 'Unsaved Changes!',
            content: 'You have unsaved changes. They are lost when you leave the page!',
            button1: 'Discard Changes',
            button2: 'Go Back',
          };

          dialogConfigKeep.disableClose = true;

          const dialogRef = this.dialog.open(AreYouSureDialogComponent, dialogConfigKeep);
          return dialogRef.afterClosed().pipe(
            switchMap(res => {
              return of(res)
            })
          );
        } else return of(true);
      })
    );
  }

  addToALMMap(remoteProjects: RemoteProject[], project: Project) {
    let remoteID: number = Number(this.ALMInstanceForm.get('remoteID')!.value);
    let accessToken: string = this.ALMInstanceForm.get('accessToken')!.value!;

    if (remoteID === undefined || remoteID === 0) {
      this.remoteIDHasError = true;
    } else {
      this.remoteIDHasError = false;

      let token: string = '';

      if (accessToken !== undefined) token = accessToken;

      this.alm
        .checkForAccessToProject(remoteID!, token)
        .pipe(take(1))
        .subscribe({
          next: response => {
            if (
              remoteProjects.findIndex(value => {
                return value.remoteProjectId === remoteID;
              }) === -1
            ) {
              let newRemoteProject = <RemoteProject>{
                accessToken: token,
                remoteProjectId: remoteID!,
                projectId: project.projectId,
              };

              remoteProjects.push(newRemoteProject);

              let index = this.remoteProjectsMinus.findIndex(value => value.remoteProject.remoteProjectId === remoteID!);
              if (index !== -1) this.remoteProjectsMinus.splice(index, 1);

              this.snackbar.openSnackBar('Remote project added.', 'green-snackbar');
            } else {
              this.snackbar.openSnackBar('Remote project already added!', 'red-snackbar');
            }
            this.ALMInstanceForm.reset();
          },
          error: error => {
            if (error.status === 401) {
              this.snackbar.openSnackBar('Access token is invalid!', 'red-snackbar');
            } else if (error.status === 404) {
              this.snackbar.openSnackBar('Remote project ID does not exist!', 'red-snackbar');
            } else {
              this.snackbar.openSnackBar('Error!');
            }
            this.ALMInstanceForm.get('remoteID')?.setValue('');
            this.ALMInstanceForm.get('accessToken')?.setValue('');
          },
        });
    }
  }

  removeFromALMMap(remoteProject: RemoteProject, remoteProjects: RemoteProject[]) {
    const dialogConfigKeep = new MatDialogConfig();

    dialogConfigKeep.data = {
      title: 'Keep selected items from this project?',
      content: 'Selected whether you want to keep items from this remote project.',
      button1: 'No, delete issues',
      button2: 'Yes, keep items',
    };

    dialogConfigKeep.disableClose = true;

    const dialogRef = this.dialog.open(AreYouSureDialogComponent, dialogConfigKeep);
    dialogRef.afterClosed().subscribe(result => {
      let object = <RemoteProjectDeleteObject>{
        keepIssues: !result, //Button 1 is true but is delete issues for me, so revert the logic
        remoteProject: remoteProject,
      };

      this.remoteProjectsMinus.push(object);

      let index: number = remoteProjects.findIndex(val => {
        return val.remoteProjectId === remoteProject.remoteProjectId;
      });

      if (index !== undefined) {
        remoteProjects.splice(index, 1);
        this.snackbar.openSnackBar('Remote project removed.', 'green-snackbar');
      }
    });
  }

  updateProjectDetails(project: Project) {
    this.data.updateProjectDetails(project, this.projectDetails.get('nameCtrl')?.value!, this.projectDetails.get('descrCtrl')?.value!).subscribe({
      next: value => {
        project.title = this.projectDetails.get('nameCtrl')?.value!;
        project.description = this.projectDetails.get('descrCtrl')?.value!;
        this.projectDetails.markAsPristine();
        this.snackbar.openSnackBar('Changes saved to the server.', 'green-snackbar');
      },
      error: error => {
        console.error(error);
        this.snackbar.openSnackBar('Error saving changes! Try again later.', 'red-snackbar');
      },
    });
  }

  updateRemoteProjects(project: Project, remoteProjects: RemoteProject[]) {
    this.data.updateRemoteProjects(project, remoteProjects, this.remoteProjectsMinus).subscribe({
      next: value => {
        this.snackbar.openSnackBar('Changes saved to the server.', 'green-snackbar');
        this.ALMInstancesSave = JSON.parse(JSON.stringify(remoteProjects));
        this.remoteProjectsMinus = [];
      },
      error: error => {
        this.snackbar.openSnackBar('Error saving changes - reverting back to the last savestate.', 'red-snackbar');
        this.resetRemoteProjects(remoteProjects);
      },
    });
  }

  resetDetails(project: Project) {
    this.projectDetails.get('nameCtrl')!.setValue(project.title);
    this.projectDetails.get('descrCtrl')!.setValue(project.description);
  }

  resetRemoteProjects(remoteProjects: RemoteProject[]) {
    remoteProjects.length = 0;
    remoteProjects.push(...this.ALMInstancesSave);
    this.remoteProjectsMinus = [];
  }
}
