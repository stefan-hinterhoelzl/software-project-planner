import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';
import { Project } from 'src/app/models/project';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss']
})
export class ProjectViewComponent implements OnInit {

  route = inject(ActivatedRoute)
  data = inject(DataService)
  cd = inject(ChangeDetectorRef)
  routeSubscription?: Subscription
  projectID?: string;
  project?: Project;
  activeView: string = ""

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.projectID = params["id"];
      this.initialize();
    });
  }

  initialize() {
    this.data.projects.pipe(map(val => {
      return val.find(val => { return val.projectId === this.projectID; });
    })
    ).subscribe((project) => {
      this.project = project;
      this.data.setActiveViewProject(project!);
    });

    this.data.activeprojectview.subscribe(value => {
      this.activeView = value;
      this.cd.detectChanges();
    });

  }

}
