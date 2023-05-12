import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  Subscription,
  tap,
  share,
  delay,
} from 'rxjs';
import { Project, Viewpoint } from 'src/app/models/project';
import { ALMDataAggregator, GitLabAggregator } from 'src/app/services/ALM/alm-data-aggregator.service';
import { BackendService } from 'src/app/services/backend.service';
import { DataService } from 'src/app/services/data.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss'],
})
export class ProjectViewComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  data = inject(DataService);
  cd = inject(ChangeDetectorRef);
  dialog = inject(MatDialog);
  snackbar = inject(SnackbarComponent);
  router = inject(Router);
  projectID?: string;
  currentViewpoint?: Viewpoint;
  _routeSubscription?: Subscription;
  _project?: Observable<Project>;
  viewpoints?: Viewpoint[];
  _activeViewpointSubscription?: Subscription;
  _activeViewpointTitle?: Observable<string>;
  aggregator: ALMDataAggregator;

  viewpoints$ = this.data.viewpoints$.pipe(share(), tap(viewpoints => this.viewpoints = viewpoints))
  activeViewpoint$ = this.data.activeViewpoint$.pipe(delay(0),share())
  project$ = this.data.activeProject$.pipe(share(), tap(project => {
    this.data.getRemoteProjects(project!.projectId, this.aggregator)
  }))


  constructor() {
    this.aggregator = new GitLabAggregator();
  }


  ngOnDestroy(): void {
    this._routeSubscription?.unsubscribe();
    this.data.setActiveViewpoint(0);
  }

  ngOnInit(): void {
    this._routeSubscription = this.route.params.subscribe(params => {
      this.projectID = params['projectId'];
      this.data.setActiveProject(this.projectID!)
      this.data.getViewpoints(this.projectID!)
      this.data.setActiveViewpoint(0);
    });
  }
}
