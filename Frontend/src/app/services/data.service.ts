import { inject, Injectable } from '@angular/core';
import { EMPTY, forkJoin, map, of, ReplaySubject, BehaviorSubject, switchMap, tap, filter, share, shareReplay } from 'rxjs';
import { User } from '@firebase/auth';
import { Project, RemoteProject, RemoteProjectDeleteObject, Viewpoint } from '../models/project';
import { UserSettings } from '../models/user';
import { ALMProject } from '../models/alm.models';
import { BackendService } from './backend.service';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { ALMDataAggregator } from './ALM/alm-data-aggregator.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  backend = inject(BackendService);
  snackbar = inject(SnackbarComponent);
  router = inject(Router);

  //**Subjects**
  //Projects
  private _projects = new BehaviorSubject<Project[]>([]);
  private _activeProjectId = new BehaviorSubject<string>("");
  private _remoteProjects = new BehaviorSubject<RemoteProject[]>([]);
  private _activeRemoteProjectId = new BehaviorSubject<number>(-1);
  private _almprojects = new ReplaySubject<ALMProject[]>(1);

  //User
  private _loggedInUser = new ReplaySubject<User>(1);
  private _userSettings = new ReplaySubject<UserSettings>(1);

  //Viewpoints
  private _viewpoints = new BehaviorSubject<Viewpoint[]>([]);
  private _activeViewpointId = new BehaviorSubject<number>(-1);

  //**Observables**
  readonly projects$ = this._projects.asObservable();
  readonly activeProject$ = this._activeProjectId
    .asObservable()
    .pipe(switchMap(id => this.projects$.pipe(map(projects => projects.find(value => value.projectId === id)),
    filter(project => project !== undefined)
    )));
  readonly remoteProjects$ = this._remoteProjects.asObservable();
  readonly activeRemoteProject$ = this._activeRemoteProjectId
    .asObservable()
    .pipe(switchMap(id => this.remoteProjects$.pipe(map(remoteProjects => remoteProjects.find(value => value.remoteProjectId === id)),
    filter(remoteProject => remoteProject !== undefined)
    )));

  readonly almProjects$ = this._almprojects.asObservable();
  readonly loggedInUser$ = this._loggedInUser.asObservable();
  readonly userSettings$ = this._userSettings.asObservable();
  readonly viewpoints$ = this._viewpoints.asObservable();
  readonly activeViewpoint$ = this._activeViewpointId
    .asObservable()
    .pipe(switchMap(id => this.viewpoints$.pipe(map(viewpoints => viewpoints.find(value => value.viewpointId === id)),
    filter(viewpoint => viewpoint !== undefined)
    )));

  private _aggregator!: ALMDataAggregator;


  constructor() {}

  getProjects() {
    this.backend.getProjects().subscribe({
      next: projects => {
        this._projects.next(projects);
      },
      error: error => {
        console.error(error);
        this.snackbar.openSnackBar('Error loading projects! Try again later.', 'red-snackbar');
      },
    });
  }

  addProject(newProject: Project, remoteProjects: RemoteProject[]) {
    this.backend
      .addProject(newProject)
      .pipe(
        switchMap((project: Project) => {
          return this.backend
            .addRemoteProjectsToProject(project.projectId, remoteProjects)
            .pipe(map(remoteProjects => ({ project, remoteProjects })));
        }),
        tap(() => this.getProjects())
      )
      .subscribe({
        next: value => {
          this.snackbar.openSnackBar('Project added!', 'green-snackbar');
          this.router.navigate(['/project/view/' + value.project.projectId]);
        },
        error: error => {
          this.snackbar.openSnackBar('Error adding Project. Try again', 'red-snackbar');
          console.error(error.error);
        },
      });
  }

  deleteProject(project: Project) {
    this.backend.deleteProjectById(project).subscribe({
      next: res => {
        this.snackbar.openSnackBar('Project ' + project.title + ' deleted.', 'green-snackbar')
        let projects: Project[] = this._projects.value.filter(p => p.projectId !== project.projectId)
        this._projects.next(projects)
        this.router.navigate(["dashboard"])
      },
      error: err => {
        this.snackbar.openSnackBar('Error deleting project. Try again', 'red-snackbar');
        console.error(err.error)
      }
    })
  }

  updateProjectDetails(project: Project, projectTitle: string, projectdescr: string) {
    let updateProject: Project = JSON.parse(JSON.stringify(project));
    updateProject.title = projectTitle;
    updateProject.description = projectdescr;

    return this.backend.updateProjectById(updateProject)
  }

  updateRemoteProjects(project: Project, remoteProjects: RemoteProject[], remoteProjectsDeltaMinus: RemoteProjectDeleteObject[]) {
    return this.backend.updateRemoteProjectFromProject(project, remoteProjects).pipe(
      switchMap(() => {
        let elements: RemoteProjectDeleteObject[] = remoteProjectsDeltaMinus.filter(value => value.keepIssues === false);
        const o_deletion = elements.map(value => {
          return this.backend.removeRemoteIssuesByRemoteProject(value.remoteProject);
        });

        if (o_deletion.length !== 0) return forkJoin(o_deletion);
        else return of(EMPTY);
      }),
      tap(() => {
        this._remoteProjects.next(remoteProjects);
        this._aggregator.getProjects(remoteProjects).subscribe({
          next: ALMvalue => {
            this._almprojects.next(ALMvalue);
          },
          error: err => {
            console.error(err);
            this.snackbar.openSnackBar(`Error loading projects from the ALM provider. (Code: ${err.code}.`, 'red-snackbar');
          },
        });

      })
    );
  }

  getViewpoints(projectId: string) {
    this.backend.getViewpointsFromProject(projectId).subscribe({
      next: viewpoints => {
        this._viewpoints.next(viewpoints);
      },
      error: error => {
        console.error(error);
        this.snackbar.openSnackBar('Error loading viewpoints! Try again later.', 'red-snackbar');
      },
    });
  }

  addViewpoint(projectId: string, viewpoint: Viewpoint, viewpoints: Viewpoint[]) {
    this.backend.addViewpointToProject(projectId, viewpoint).subscribe({
      next: (newViewpoint: Viewpoint) => {
        this.snackbar.openSnackBar(`Viewpoint ${newViewpoint.title} created!`, 'green-snackbar');
        this._viewpoints.next([...viewpoints, newViewpoint]);
        this._activeViewpointId.next(newViewpoint.viewpointId!);
      },
      error: error => {
        console.error(error);
        this.snackbar.openSnackBar('Error saving Viewpoint! Try again later.', 'red-snackbar');
      },
    });
  }

  updateViewpoint(projectId: string, viewpoint: Viewpoint, viewpoints: Viewpoint[]) {
    return this.backend.updateViewpointByID(viewpoint.viewpointId!, projectId, viewpoint).subscribe({
      next: (changedViewpoint: Viewpoint) => {
        let index: number = viewpoints.findIndex(value => value.viewpointId === viewpoint.viewpointId);
        viewpoints[index] = changedViewpoint;
        this._viewpoints.next(viewpoints);
        this._activeViewpointId.next(changedViewpoint.viewpointId!);
        this.snackbar.openSnackBar(`Viewpoint changes saved to the server!`, 'green-snackbar');
      },
      error: error => {
        console.error(error);
        this.snackbar.openSnackBar('Error changing Viewpoint! Try again later.', 'red-snackbar');
      },
    });
  }

  deleteViewpoint(viewpoint: Viewpoint, viewpoints: Viewpoint[]) {
    this.backend.deleteViewpointById(viewpoint).subscribe({
      next: res => {
        this.snackbar.openSnackBar(`Viewpoint No. ${viewpoint.viewpointId} was deleted from this project.`, 'green-snackbar')
        this._viewpoints.next([...viewpoints.filter(viewp => viewp.viewpointId !== viewpoint.viewpointId)])
        this.setActiveViewpoint(0);
      },
      error: error => {
        console.error(error);
        this.snackbar.openSnackBar('Error deleting viewpoint. Try again.', 'red-snackbar')
      }
    })
  }

  getRemoteProjects(projectId: string, aggreagtor: ALMDataAggregator) {
    if (this._aggregator === undefined) this._aggregator = aggreagtor;
    this.backend.getRemoteProjectsForProject(projectId).subscribe({
      next: value => {
        if (value !== undefined) {
          this._remoteProjects.next(value);
          aggreagtor.getProjects(value).subscribe({
            next: ALMvalue => {
              this._almprojects.next(ALMvalue);
            },
            error: err => {
              console.error(err);
              this.snackbar.openSnackBar(`Error loading projects from the ALM provider. (Code: ${err.code}.`, 'red-snackbar');
            },
          });
        }
      },
      error: error => {
        console.error(error);
        this.snackbar.openSnackBar('Error loading remote projects! Try again later.', 'red-snackbar');
      },
    });
  }

  getSelectedIssuesForViewpoint(viewpointId: number) {
    let projectId: string = this._activeProjectId.value
    console.log(projectId)
    return this.backend.getSelectedRemoteIssuesForViewpointAndRemoteProject(projectId, viewpointId)
  }

  // Setters
  setUser(value: User) {
    this._loggedInUser.next(value);
  }

  setActiveProject(value: string) {
    this._activeProjectId.next(value);
  }

  setActiveRemoteproject(value: number) {
    this._activeRemoteProjectId.next(value);
  }

  setUserSettings(value: UserSettings) {
    this._userSettings.next(value);
  }

  setProjects(value: Project[]) {
    this._projects.next(value);
  }

  setAlmProjects(value: ALMProject[]) {
    this._almprojects.next(value);
  }

  setRemoteProjects(value: RemoteProject[]) {
    console.log("New Remoteprojects: ",value)
    this._remoteProjects.next(value);
  }

  setActiveViewpoint(value: number) {
    this._activeViewpointId.next(value);
  }


  //Static getter
  get staticRemoteProjects() {
    console.log(this._remoteProjects.value)
    return this._remoteProjects.value
  }
}
