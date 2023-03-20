import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { User } from '@firebase/auth';
import { Project, RemoteProject, Viewpoint } from '../models/project';
import { UserSettings } from '../models/user';
import { ALMProject } from '../models/alm.models';
import { BackendService } from './backend.service';
import { SnackbarComponent } from '../snackbar/snackbar.component';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  backend = inject(BackendService)
  snackbar = inject(SnackbarComponent)
  //reactive trys here

  //**Subjects**
  //Projects
  private _projects = new ReplaySubject<Project[]>(1)
  private _activeProject = new Subject<Project>
  private _remoteProjects = new ReplaySubject<RemoteProject[]>(1);
  private _almprojects = new ReplaySubject<ALMProject[]>(1)

  //User
  private _loggedInUser = new ReplaySubject<User>(1)
  private _userSettings = new ReplaySubject<UserSettings>(1)


  //Viewpoints
  private _activeViewpoint = new ReplaySubject<Viewpoint | undefined>(1);


  //Observables
  readonly projects$ = this._projects.asObservable();
  readonly activeProject$ = this._activeProject.asObservable();
  readonly remoteProjects$ = this._remoteProjects.asObservable();
  readonly almProjects$ = this._almprojects.asObservable();
  readonly loggedInUser$ = this._loggedInUser.asObservable();
  readonly userSettings$ = this._userSettings.asObservable();
  readonly activeViewpoint$ = this._activeViewpoint.asObservable();



  constructor() { }

  getProjects() {
    this.backend.getProjects().subscribe({
      next: projects => {
        this._projects.next(projects);
      },
      error: error => {
        console.error(error)
        this.snackbar.openSnackBar('Error loading projects! Try again later.', 'red-snackbar');
      },
    });
  }

  getLocalProjectByID() {
    return this.projects$.pipe()
  }

  addProject(newProject: Project, projects: Project[]) {
    this.backend.addProject(newProject).subscribe({
      next: () => {
        this._projects.next([...projects, newProject])
      },
      error: error => {
        console.error(error)
        this.snackbar.openSnackBar('Error saving project! Try again later', 'red-snackbar')
      }
    })
  }


// Setters
  setUser(value: User) {
    this._loggedInUser.next(value);
  }

  setActiveProject(value: Project) {
    this._activeProject.next(value)
  }

  setUserSettings(value: UserSettings) {
    this._userSettings.next(value);
  }

  setProjects(value: Project[]) {
    this._projects.next(value);
  }

  setAlmProjects(value: ALMProject[]) {
    this._almprojects.next(value)
  }

  setRemoteProjects(value: RemoteProject[]) {
    this._remoteProjects.next(value);
  }

  setActiveViewpoint(value: Viewpoint | undefined) {
    this._activeViewpoint.next(value)
  }
}
