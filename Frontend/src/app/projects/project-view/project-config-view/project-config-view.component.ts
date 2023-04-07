import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { tap } from 'rxjs';
import { Project } from 'src/app/models/project';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-project-config-view',
  templateUrl: './project-config-view.component.html',
  styleUrls: ['./project-config-view.component.scss']
})
export class ProjectConfigViewComponent {

  data = inject(DataService)
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
        if (project !== undefined) {
          this.projectDetails.get("nameCtrl")!.setValue(project.title);
          this.projectDetails.get("descrCtrl")!.setValue(project.description);
        }
    })
  );

  remoteProjects$ = this.data.remoteProjects$;

  hide: boolean = true;

  addToALMMap() {

  }


  removeFromALMMap(remoteProjectId: number) {

  }


  updateProject(project: Project) {
    
  }

}


