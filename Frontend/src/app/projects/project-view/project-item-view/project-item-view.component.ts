import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, mergeMap, Observable, of, share, Subscription, switchMap, tap } from 'rxjs';
import { Project, Viewpoint } from 'src/app/models/project';
import { ALMDataAggregator } from 'src/app/services/ALM/alm-data-aggregator.service';
import { GitLabAggregator } from 'src/app/services/ALM/alm-data-aggregator.service';
import { BackendService } from 'src/app/services/backend.service';
import { DataService } from 'src/app/services/data.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';

@Component({
  selector: 'app-project-item-view',
  templateUrl: './project-item-view.component.html',
  styleUrls: ['./project-item-view.component.scss'],
})
export class ProjectItemViewComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  data = inject(DataService);
  snackbar = inject(SnackbarComponent);
  backend = inject(BackendService);

  aggregator: ALMDataAggregator;
  _routeSubscription?: Subscription;
  _ALMProjectsSubscription?: Subscription;
  _remoteProjectsSubscription?: Subscription;
  _project?: Observable<Project>;
  _viewPointSubscription?: Subscription;
  viewpoint?: Viewpoint;
  notExisting: boolean = false;
  loading: boolean = true;

  constructor() {
    //move to onInit with possible logic determining the type of aggregator
    this.aggregator = new GitLabAggregator();
  }

  ngOnDestroy(): void {
    this._routeSubscription?.unsubscribe();
    this._ALMProjectsSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.loading = true;
    this.notExisting = false;
    this._viewPointSubscription = this.route.params
      .pipe(
        switchMap(value => {
          let projectId: string = this.route.parent?.snapshot.params['projectId'];
          return this.backend.getViewpointByID(Number(value['viewpointId']), projectId);
        })
      )
      .pipe(share())
      .subscribe({
        next: value => {
          this.viewpoint = value;
          this.data.setActiveViewpoint(value);
          this.initialize();
        },
      });
  }
  initialize() {
    this._ALMProjectsSubscription = this.data.activeviewproject
      .pipe(
        switchMap(project => this.backend.getRemoteProjectsForProject(project.projectId)),
        switchMap(rProjects => this.aggregator.getProjects(rProjects))
      ).subscribe({
        next: almProjects => {
          this.data.setAlmProjects(almProjects);
          this.loading = false;
        },
        error: err => {
          this.snackbar.openSnackBar(`Error loading projects from the ALM provider. (Code: ${err.code}.`, 'red-snackbar');
        },
      });
  }
}
