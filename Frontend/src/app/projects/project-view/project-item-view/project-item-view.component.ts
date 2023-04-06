import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, combineLatest, map, mergeMap, noop, Observable, of, share, Subscription, switchMap, tap, throwError, timeout, timeoutWith } from 'rxjs';
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
export class ProjectItemViewComponent {
  route = inject(ActivatedRoute);
  data = inject(DataService);
  cd = inject(ChangeDetectorRef);
  snackbar = inject(SnackbarComponent);

  _routeSubscription?: Subscription;
  _ALMProjectsSubscription?: Subscription;
  _remoteProjectsSubscription?: Subscription;
  _project?: Observable<Project>;
  _viewPointSubscription?: Subscription;
  viewpoint?: Viewpoint;

  project$ = this.data.activeProject$;
  viewpoint$ = this.data.activeViewpoint$;
  remoteProjects$ = this.data.remoteProjects$;
  view$ = combineLatest([this.project$, this.viewpoint$]);

}
