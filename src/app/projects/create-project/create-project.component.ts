import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ChangeDetectorRef, Component, inject, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, take } from 'rxjs';
import { Project } from 'src/app/models/project';
import { DataService } from 'src/app/services/data.service';
import { User } from '@firebase/auth';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss']
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
  @ViewChild('autosize', {static: false}) autosize!: CdkTextareaAutosize;
  loggedUser: User | undefined;
  routeSubscription?: Subscription;



  firstFormGroup = this.fb.group({
    nameCtrl: ['', Validators.required],
  });

  secondFormGroup = this.fb.group({
    descrCtrl: ['', Validators.required]
  });

  constructor() {

  }


  ngOnInit(): void {
    this.data.user.pipe(take(1)).subscribe(value => {
      this.loggedUser = value;
    })

    this.routeSubscription = this.route.params.subscribe(params => {
      let id: string = params["id"]
      this.projectid = id;
      if (this.projectid != undefined) this.initialize(id)
    })




  }

  initialize(id: string) {
    //load_project_here

    this.firstFormGroup.get('nameCtrl')?.setValue("project_name")
    this.secondFormGroup.get('descrCtrl')?.setValue("project_descr")
  }

  triggerResize() {
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }


  saveProject() {
    const newProject = {} as Project;
    newProject.name = this.firstFormGroup.get('nameCtrl')?.value!;
    newProject.description = this.secondFormGroup.get('descrCtrl')?.value!;
    newProject.owner = this.loggedUser?.uid!;
    newProject.gitLabInstances = [];

    this.firestore.addProject(newProject).then(()=> {
      this.snackbar.openSnackBar('Projekt angelegt!', 'green-snackbar')
      this.router.navigate(['/dashboard'])
    });

  }

}
