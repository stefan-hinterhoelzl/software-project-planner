import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
  
  map,
  Observable,
 
  Subscription,
 
  tap,
  of,
  share,
  catchError,
} from 'rxjs';
import { NewViewpointDialogComponent } from 'src/app/dialogs/new-viewpoint-dialog/new-viewpoint-dialog.component';
import { Project, ProjectWrapper, Viewpoint } from 'src/app/models/project';
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
  backend = inject(BackendService);
  cd = inject(ChangeDetectorRef);
  dialog = inject(MatDialog);
  snackbar = inject(SnackbarComponent);
  router = inject(Router);
  projectID?: string;
  currentViewpoint?: Viewpoint;
  _routeSubscription?: Subscription;
  _project?: Observable<Project>;
  _viewpoints?: Observable<Viewpoint[]>;
  _activeViewpointSubscription?: Subscription;
  _activeViewpointTitle?: Observable<string>;

  
  ngOnDestroy(): void {
    this._routeSubscription?.unsubscribe();
    this._activeViewpointSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.data.setActiveViewpointTitle("Select a Viewpoint...")
    this._activeViewpointSubscription = this.data.activeViewpoint.subscribe(value => {
      this.currentViewpoint = value;
    });
    this._activeViewpointTitle = this.data.activeViewpointTitle.pipe(share());
    
    this._routeSubscription = this.route.params.subscribe(params => {
      this.projectID = params['id'];
      this.initialize();
    });
  }

  initialize() {
    this._project = this.data.projects.pipe(
      map(val => val.find(val => val.projectId === this.projectID)!),
      tap(val => this.data.setActiveViewProject(val!)),
      catchError(err => of().pipe(tap(() => this.snackbar.openSnackBar('Server error while loading project! Try again later.', 'red-snackbar')))),
      share()
    );

    this._viewpoints = this.getViewpointsObservable();
    
  }

  createViewpoint() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(NewViewpointDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((data: string) => {
      if (data !== '') {
        const newViewpoint = <Viewpoint>{
          title: data,
        };

        this.backend.addViewpointToProject(this.projectID!, newViewpoint).subscribe({
          next: value => {
            this.snackbar.openSnackBar('Viewpoint was added to the project', 'green-snackbar');
            this._viewpoints = this.getViewpointsObservable();
          },
          error: error => {
            this.snackbar.openSnackBar('Server error while saving viewpoint! Try again later', 'red-snackbar');
            console.error(error.error);
          },
        });
      }
    });
  }

  chooseViewpoint(viewpoint: Viewpoint) {
    this.currentViewpoint = viewpoint;
    this.data.setActiveViewpoint(viewpoint)
  }

  getViewpointsObservable() {
    return this.backend.getViewpointsFromProject(this.projectID!).pipe(
      catchError(err =>
        of().pipe(tap(() => this.snackbar.openSnackBar('Server error while loading viewpoints for the project! Try again later.', 'red-snackbar')))
      ),
      share()
    );
  }
}
