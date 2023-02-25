import { AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Data, Router } from '@angular/router';
import {
  filter,
  map,
  Observable,
  BehaviorSubject,
  Subscription,
  switchMap,
  tap,
  of,
  share,
  catchError,
  pipe,
  EMPTY,
  ReplaySubject,
  take,
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
  currentRoute: string = '';
  _routeSubscription?: Subscription;
  _project?: Observable<Project>;
  _viewpoints?: Observable<Viewpoint[]>;
  _activeView?: Observable<string>;

  $activeViewpoint = new ReplaySubject<string>(1);
  _activeViewpoint = this.$activeViewpoint.asObservable();

  ngOnDestroy(): void {
    this._routeSubscription?.unsubscribe();
  }

  ngOnInit(): void {
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

    let path = this.route.firstChild?.snapshot.routeConfig?.path;


    //Apply correct visual settings after reload
    if (path === 'overview') {
      this.currentRoute = 'dashboard';
      this.$activeViewpoint.next('Select a Viewpoint...');
    } else if (path === 'config') {
      this.currentRoute = 'config';
      this.$activeViewpoint.next('Select a Viewpoint...');
    } else {
      this.currentRoute = 'viewpoint';
      let id: number = Number(this.route.firstChild?.snapshot.params['viewpointId']);
      this._viewpoints
        .pipe(
          map(value => {
            console.log(value);
            return value.find(view => {
              return view.viewpointId === id;
            });
          }),
          take(1)
        )
        .subscribe(value => {
          return this.$activeViewpoint.next(value?.title!);
        });
    }
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

  handleClick(activeButton: string) {
    this.currentRoute = activeButton;
    this.$activeViewpoint.next('Select a Viewpoint...');
  }

  chooseViewpoint(viewpoint: Viewpoint) {
    this.$activeViewpoint.next(viewpoint.title);
    this.currentRoute = 'viewpoint';
    this.router.navigate(['viewpoint', viewpoint.viewpointId], { relativeTo: this.route });
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
