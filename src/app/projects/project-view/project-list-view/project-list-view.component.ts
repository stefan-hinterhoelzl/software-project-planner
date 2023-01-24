import { Component, inject, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { Project } from 'src/app/models/project';
import { ALMService } from 'src/app/services/alm.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-project-list-view',
  templateUrl: './project-list-view.component.html',
  styleUrls: ['./project-list-view.component.scss']
})
export class ProjectListViewComponent implements OnInit {

  project?: Project;
  issues?: any[] = [];


  ngOnInit(): void {
    this.data.setActiveProjectView('list');

    this.data.activeviewproject.pipe(take(1)).subscribe(project => {
      this.project = project;
      this.loadIssues();
    })
  }

  data = inject(DataService)
  alm = inject(ALMService)



  loadIssues() {
    this.project?.ALMInstances.forEach((value, index, array) => {
      this.alm.getAllIssuesOfProject(value.remoteID, value.accessToken)
      .pipe(take(1))
        .subscribe({
          next: (response) => {
            this.issues?.push(...response.body as any[])
          }, error: (error) => {
            console.error(error);
          }});
    })

    this.alm


  }


}
