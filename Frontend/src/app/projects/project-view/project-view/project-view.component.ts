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
  delay,
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
  viewpoints?: Viewpoint[];
  _activeViewpointSubscription?: Subscription;
  _activeViewpointTitle?: Observable<string>;

  viewpoints$ = this.data.viewpoints$.pipe(share(), tap(viewpoints => this.viewpoints = viewpoints))
  activeViewpoint$ = this.data.activeViewpoint$.pipe(delay(0),share())
  project$ = this.data.activeProject$.pipe(share(), tap(value => console.log(value)))


  ngOnDestroy(): void {
    this._routeSubscription?.unsubscribe();
    this.data.setActiveViewpoint(0);
  }

  ngOnInit(): void {
    // this._activeViewpointSubscription = this.data.activeViewpoint$.subscribe(value => {
    //   this.currentViewpoint = value;
    // });
    this._routeSubscription = this.route.params.subscribe(params => {
      this.projectID = params['projectId'];
      this.data.setActiveProject(this.projectID!)
      this.data.getViewpoints(this.projectID!)
      //this.data.setActiveViewpoint(0);

    });
  }
  createViewpoint() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(NewViewpointDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((data: string) => {
      if (data !== undefined) {
        const newViewpoint = <Viewpoint>{
          title: data,
        };

        this.data.addViewpoint(this.projectID!, newViewpoint, this.viewpoints!)

      }
    });
  }

  // chooseViewpoint(viewpoint: Viewpoint) {
  //   this.router.navigate(['viewpoint'], {relativeTo: this.route})
  // }

  // getViewpointsObservable() {
  //   return this.backend.getViewpointsFromProject(this.projectID!).pipe(
  //     catchError(err =>
  //       of().pipe(tap(() => this.snackbar.openSnackBar('Server error while loading viewpoints for the project! Try again later.', 'red-snackbar')))
  //     ),
  //     share()
  //   );
  // }
}
