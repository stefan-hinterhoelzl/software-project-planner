import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { switchMap, tap } from 'rxjs';
import { RemoteProject } from 'src/app/models/project';
import { BackendService } from 'src/app/services/backend.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-project-config-view',
  templateUrl: './project-config-view.component.html',
  styleUrls: ['./project-config-view.component.scss']
})
export class ProjectConfigViewComponent  {

  data = inject(DataService)
  backend = inject(BackendService)
  fb = inject(FormBuilder)


  projectDetails = this.fb.group({
    nameCtrl: ['', Validators.required],
    descrCtrl: ['', Validators.required]
  });

  ALMInstances = this.fb.group({
    remoteID: [''],
    accessToken: [''],
  })

  project$ = this.data.activeProject$.pipe(
              tap(project => {
                  this.projectDetails.get("nameCtrl")!.setValue(project.title);
                  this.projectDetails.get("descrCtrl")!.setValue(project.description);
              })
  );

  remoteProjects$ = this.project$.pipe(switchMap(project => this.backend.getRemoteProjectsForProject(project.projectId)));

  hide: boolean = true;

  addToALMMap() {

  }


  removeFromALMMap(remoteProjectId: number) {

  }

}


