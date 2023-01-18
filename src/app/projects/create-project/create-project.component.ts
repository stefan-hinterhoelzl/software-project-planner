import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  Component,
  inject,
  OnInit,
  ViewChild,
  NgZone,
} from '@angular/core';
import {
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Subscription, take } from 'rxjs';
import { Project, RemoteProject } from 'src/app/models/project';
import { DataService } from 'src/app/services/data.service';
import { User } from '@firebase/auth';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit {
  fb = inject(FormBuilder);
  data = inject(DataService);
  firestore = inject(FirestoreService);
  _ngZone = inject(NgZone);
  snackbar = inject(SnackbarComponent);
  router = inject(Router);
  route = inject(ActivatedRoute);
  projectid?: string;
  editMode: boolean = false;
  project: Project | undefined;
  @ViewChild('autosize', { static: false }) autosize!: CdkTextareaAutosize;
  loggedUser: User | undefined;
  routeSubscription?: Subscription;

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


  constructor() {}

  ngOnInit(): void {
    this.data.user.pipe(take(1)).subscribe((value) => {
      this.loggedUser = value;
    });

    this.routeSubscription = this.route.params.subscribe((params) => {
      let id: string = params['id'];
      this.projectid = id;
      if (this.projectid != undefined) {
        this.initialize(id);
      }
    });
  }

  initialize(id: string) {
    this.data.projects.pipe(take(1)).subscribe((value) => {
      console.log(value)
      this.project = value.find((project) => {
        return project.uid === id;
      });

      this.editMode = true;

      if (this.project != undefined) {
        this.firstFormGroup.get('nameCtrl')?.setValue(this.project.name);
        this.secondFormGroup
          .get('descrCtrl')
          ?.setValue(this.project.description);
        this.ALMInstances = this.project.ALMInstances;
      }
    });
  }

  triggerResize() {
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  saveProject() {
    if (!this.editMode) {
      const newProject = {} as Project;
      newProject.name = this.firstFormGroup.get('nameCtrl')?.value!;
      newProject.description = this.secondFormGroup.get('descrCtrl')?.value!;
      newProject.owner = this.loggedUser?.uid!;
      newProject.ALMInstances = this.ALMInstances;
      newProject.favourite = false;

      this.firestore.addProject(newProject).then(() => {
        this.snackbar.openSnackBar('Project added!', 'green-snackbar');
        this.router.navigate(['/dashboard']);
      });
    } else {
      if (this.project != undefined) {
        this.project.name = this.firstFormGroup.get('nameCtrl')?.value!;
        this.project.description =
          this.secondFormGroup.get('descrCtrl')?.value!;
        this.project.ALMInstances = this.ALMInstances;

        this.firestore.updateProject(this.project).then(() => {
          this.snackbar.openSnackBar('Project saved!', 'green-snackbar');
          this.router.navigate(['/dashboard']);
        });
      }
    }
  }

  addToALMMap() {

    //TODO Checking here if already added

    this.ALMInstances.push({
      remoteID: this.thirdFormGroup.get('remoteID')?.value!,
      accessToken: this.thirdFormGroup.get('accessToken')?.value!
    });

    this.thirdFormGroup.get('remoteID')?.setValue('')
    this.thirdFormGroup.get('accessToken')?.setValue('')
  }

  removeFromALMMap(ID: string) {
    this.ALMInstances = this.ALMInstances.filter(val => { return val.remoteID !== ID})
  }
}
