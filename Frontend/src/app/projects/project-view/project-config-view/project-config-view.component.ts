import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { combineLatest, take, tap } from 'rxjs';
import { AreYouSureDialogComponent } from 'src/app/dialogs/are-you-sure-dialog/are-you-sure-dialog.component';
import { Project, RemoteProject, RemoteProjectDeleteObject } from 'src/app/models/project';
import { GitlabALMService } from 'src/app/services/ALM/Adapater Services/gitLab.service';
import { DataService } from 'src/app/services/data.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';

@Component({
  selector: 'app-project-config-view',
  templateUrl: './project-config-view.component.html',
  styleUrls: ['./project-config-view.component.scss']
})
export class ProjectConfigViewComponent {

  data = inject(DataService)
  fb = inject(FormBuilder)
  alm = inject(GitlabALMService);
  snackbar = inject(SnackbarComponent);
  dialog = inject(MatDialog);

  constructor() {
    this.projectsLoading = false;
    this.remoteIDHasError = false;
    this.hide = true;
    this.remoteProjectsMinus = []
  }

  //Variables to restore to
  ALMInstancesSave!: RemoteProject[];

  projectDetails = this.fb.group({
    nameCtrl: ['', Validators.required],
    descrCtrl: ['', Validators.required]
  });

  ALMInstanceForm = this.fb.group({
    remoteID: ['', Validators.required],
    accessToken: ['', Validators.required],
  })

  project$ = this.data.activeProject$.pipe(
    tap(project => {
      if (project !== undefined) {
        console.log(project)
        this.projectDetails.get("nameCtrl")!.setValue(project.title);
        this.projectDetails.get("descrCtrl")!.setValue(project.description);
      }
    })
  );

  remoteProjects$ = this.data.remoteProjects$

  view$ = combineLatest([this.project$, this.remoteProjects$])

  //State Booleans
  hide: boolean;
  projectsLoading: boolean;
  remoteIDHasError: boolean;

  //Delta Object
  remoteProjectsMinus: RemoteProjectDeleteObject[];



  addToALMMap(remoteProjects: RemoteProject[]) {
    let remoteID: number  = Number(this.ALMInstanceForm.get("remoteID")!.value)
    let accessToken: string = this.ALMInstanceForm.get("accessToken")!.value!

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
              remoteProjects.push({
                accessToken: token,
                remoteProjectId: remoteID!,
              });

              this.snackbar.openSnackBar('Remote project added!', 'green-snackbar');
            } else {
              this.snackbar.openSnackBar('Project already added!', 'red-snackbar');
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
      title: "Keep selected items from this project?",
      content: "Selected whether you want to keep items from this remote project.",
      button1: "No, delete issues",
      button2: "Yes, keep items"
    };

    dialogConfigKeep.disableClose = true;

    const dialogRef = this.dialog.open(AreYouSureDialogComponent, dialogConfigKeep);
    dialogRef.afterClosed().subscribe(result => {
      let object = <RemoteProjectDeleteObject> {
        keepIssues: result,
        remoteProject: remoteProject
      }

      this.remoteProjectsMinus.push(object)

      let index: number = remoteProjects.findIndex(val => {
        return val.remoteProjectId === remoteProject.remoteProjectId;
      });

     if (index !== undefined) remoteProjects.splice(index, 1)

    });
  }

   updateProjectDetails(project: Project) {
     this.data.updateProjectDetails(project, this.projectDetails.get('nameCtrl')?.value!, this.projectDetails.get('descrCtrl')?.value!)
   }

  updateRemoteProjects(remoteProjects: RemoteProject[]) {

  }

  resetDetails(project: Project) {
    this.projectDetails.get("nameCtrl")!.setValue(project.title);
    this.projectDetails.get("descrCtrl")!.setValue(project.description);
  }

  resetRemoteProjects(remoteProjects: RemoteProject[]) {
    remoteProjects.push(...this.remoteProjectsMinus.map(value => value.remoteProject))
    this.remoteProjectsMinus = [];
  }

}


