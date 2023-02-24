import { AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { filter, map, Observable, BehaviorSubject, Subscription, switchMap, tap, of, share } from 'rxjs';
import { NewViewpointDialogComponent } from 'src/app/dialogs/new-viewpoint-dialog/new-viewpoint-dialog.component';
import { Project, ProjectWrapper, Viewpoint } from 'src/app/models/project';
import { BackendService } from 'src/app/services/backend.service';
import { DataService } from 'src/app/services/data.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss']
})
export class ProjectViewComponent implements OnInit, OnDestroy {



  route = inject(ActivatedRoute)
  data = inject(DataService)
  backend = inject(BackendService)
  cd = inject(ChangeDetectorRef)
  dialog = inject(MatDialog)
  snackbar = inject(SnackbarComponent)
  projectID?: string;
  _routeSubscription?: Subscription
  _projectWrapper?: Observable<ProjectWrapper>;
  _activeView?: Observable<string>;


  $activeViewpoint = new BehaviorSubject<string>("Select a Viewpoint...")
  _activeViewpoint = this.$activeViewpoint.asObservable()

  ngOnDestroy(): void {
    this._routeSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this._routeSubscription = this.route.params.subscribe(params => {
      this.projectID = params["id"];
      this.initialize();
    });
  }

  initialize() {
    this._activeView = this.data.activeprojectview.pipe(
      tap(val => this.cd.detectChanges())
    );

    this._projectWrapper = this.data.projects.pipe(
      map(val => val.find(val => val.projectId === this.projectID)!),
      tap(val => this.data.setActiveViewProject(val!)),
      switchMap((project: Project) => {
        return this.backend.getViewpointsFromProject(project.projectId)
        .pipe(map((viewPoints: Viewpoint[]) => ({ project, viewPoints })))
      }),
      tap(projectWrapper => console.log(projectWrapper)),
      share()
    )
  }

  createViewpoint() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(NewViewpointDialogComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .subscribe((data: string) => {
        if (data !== "") {
          const newViewpoint = <Viewpoint> {
            title: data
          }

          this.backend.addViewpointToProject(this.projectID!, newViewpoint).subscribe({
            next: (value) => {
              this.snackbar.openSnackBar("Viewpoint was added to the project", "green-snackbar")
            },
            error: (error) => {
              this.snackbar.openSnackBar("Error saving viewpoint! Try again later", "red-snackbar")
              console.error(error.error)
            }
          })
        }
      });
  }


}
