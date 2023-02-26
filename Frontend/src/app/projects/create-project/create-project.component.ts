import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, inject, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { map, Subscription, switchMap, take } from 'rxjs';
import { Project, RemoteProject } from 'src/app/models/project';
import { DataService } from 'src/app/services/data.service';
import { User, getAuth } from '@firebase/auth';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ALMService } from 'src/app/services/alm.service';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit {
  fb = inject(FormBuilder);
  data = inject(DataService);
  alm = inject(ALMService);
  firestore = inject(FirestoreService);
  backend = inject(BackendService);
  _ngZone = inject(NgZone);
  snackbar = inject(SnackbarComponent);
  router = inject(Router);
  route = inject(ActivatedRoute);

  @ViewChild('autosize', { static: false }) autosize!: CdkTextareaAutosize;
  loggedUser: User | undefined;

  firstFormGroup = this.fb.group({
    nameCtrl: ['', Validators.required],
  });

  secondFormGroup = this.fb.group({
    descrCtrl: ['', Validators.required],
  });

  thirdFormGroup = this.fb.group({
    remoteID: [''],
    accessToken: [''],
  });
  hide = true;

  ALMInstances: RemoteProject[] = [];
  remoteID?: number;
  accessToken?: string;
  remoteIDHasError: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.data.user.pipe(take(1)).subscribe((value) => {
      this.loggedUser = value;
    });

    this.thirdFormGroup.controls['remoteID'].valueChanges.subscribe((value) => {
      this.remoteID = +value!;
    });

    this.thirdFormGroup.controls['accessToken'].valueChanges.subscribe(
      (value) => {
        this.accessToken = value!;
      }
    );
  }

  triggerResize() {
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  saveProject() {
    const auth = getAuth();

    const newProject = {} as Project;
    newProject.title = this.firstFormGroup.get('nameCtrl')?.value!;
    newProject.description = this.secondFormGroup.get('descrCtrl')?.value!;
    newProject.favourite = false;
    newProject.owner = auth.currentUser?.uid!;

    this.backend
      .addProject(newProject)
      .pipe(
        switchMap((project: Project) => {
            return this.backend
            .addRemoteProjectsToProject(project.projectId, this.ALMInstances)
            .pipe(map((remoteProjects) => ({ project, remoteProjects })));
        })
      )
      .subscribe({
        next: (value) => {
          this.snackbar.openSnackBar('Project added!', 'green-snackbar');
          this.backend.getProjects();
          this.router.navigate(['/project/view/' + value.project.projectId]);
        },
        error: (error) => {
          this.snackbar.openSnackBar(
            'Error adding Project. Try again',
            'red-snackbar'
          );
          console.error(error.error);
        },
      });
  }

  addToALMMap() {
    if (this.remoteID === undefined) {
      console.log('I am here');
      this.remoteIDHasError = true;
    } else {
      this.remoteIDHasError = false;
      this.alm
        .checkForAccessToProject(this.remoteID!, this.accessToken!)
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            if (
              this.ALMInstances.findIndex((value) => {
                return value.remoteProjectId === this.remoteID;
              }) === -1
            ) {
              this.ALMInstances.push({
                accessToken:
                  this.accessToken === undefined ? '' : this.accessToken,
                  remoteProjectId: this.remoteID!,
              });

              this.snackbar.openSnackBar(
                'Remote project added!',
                'green-snackbar'
              );
            } else {
              this.snackbar.openSnackBar(
                'Project already added!',
                'red-snackbar'
              );
            }
            this.thirdFormGroup.get('remoteID')?.setValue('');
            this.thirdFormGroup.get('accessToken')?.setValue('');
          },
          error: (error) => {
            if (error.status === 401) {
              this.snackbar.openSnackBar(
                'Access token is invalid!',
                'red-snackbar'
              );
            } else if (error.status === 404) {
              this.snackbar.openSnackBar(
                'Remote project ID does not exist!',
                'red-snackbar'
              );
            } else {
              this.snackbar.openSnackBar('Error!');
            }
            this.thirdFormGroup.get('remoteID')?.setValue('');
            this.thirdFormGroup.get('accessToken')?.setValue('');
          },
        });
    }
  }

  removeFromALMMap(ID: number) {
    this.ALMInstances = this.ALMInstances.filter((val) => {
      return val.remoteProjectId !== ID;
    });
  }
}
