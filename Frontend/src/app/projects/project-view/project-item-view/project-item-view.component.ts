import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, Observable, of, share, Subscription, switchMap, tap } from 'rxjs';
import { Project, Viewpoint } from 'src/app/models/project';
import { ALMDataAggregator, GitLabService } from 'src/app/services/alm-data-aggregator.service';
import { BackendService } from 'src/app/services/backend.service';
import { DataService } from 'src/app/services/data.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';

@Component({
  selector: 'app-project-item-view',
  templateUrl: './project-item-view.component.html',
  styleUrls: ['./project-item-view.component.scss']
})
export class ProjectItemViewComponent implements OnInit, OnDestroy {

  route = inject(ActivatedRoute)
  data = inject(DataService)
  snackbar = inject(SnackbarComponent)
  backend = inject(BackendService)

  aggregator: ALMDataAggregator;
  _routeSubscription?: Subscription;
  _project?: Observable<Project>;
  _viewPointSubscription?: Subscription;
  viewpoint?: Viewpoint;



  constructor() {
    //move to onInit with possible logic determining the type of aggregator
    this.aggregator = new GitLabService()
  }


  ngOnDestroy(): void {
    this._routeSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this._viewPointSubscription = this.route.params.pipe(switchMap(value =>  {
      let projectId: string = this.route.parent?.snapshot.params["id"]
      return this.backend.getViewpointByID(Number(value["viewpointId"]), projectId)
    })).pipe(share()).subscribe(value => {
      if (value !== undefined) {
        this.viewpoint = value
        this.data.setActiveViewpoint(value)
      } else {
        this.snackbar.openSnackBar("This Viewpoint does not exist on this project (TODO)", "red-snackbar")
      }
    }
    );
  }

  initialize(viewpointId: number) {
    this._project = this.data.activeviewproject.pipe(share());
  }

}
