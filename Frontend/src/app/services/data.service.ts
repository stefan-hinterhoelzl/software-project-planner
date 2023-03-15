import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { User } from '@firebase/auth';
import { Project, RemoteProject, Viewpoint } from '../models/project';
import { UserSettings } from '../models/user';
import { ALMProject } from '../models/alm.models';


@Injectable({
  providedIn: 'root'
})
export class DataService {


  //reactive trys here


  private activeProjectSub = new ReplaySubject<Project>(1)
  private remoteProjectsSub = new ReplaySubject<RemoteProject[]>(1);
  readonly activeProject$ = this.remoteProjectsSub.asObservable();
  readonly remoteProjects$ = this.remoteProjectsSub.asObservable();





  private _header = new BehaviorSubject<string>("Software Project Planner")
  private _loggedInUser = new ReplaySubject<User>(1)
  private _userSettings = new ReplaySubject<UserSettings>(1)
  private _projects = new ReplaySubject<Project[]>(1)
  private _activeViewProject = new ReplaySubject<Project>(1)
  private _almprojects = new ReplaySubject<ALMProject[]>(1)
  private _remoteProjects = new ReplaySubject<RemoteProject[]>(1);
  private _activeViewpoint = new ReplaySubject<Viewpoint | undefined>(1);
  private _activeViewpointTitle = new ReplaySubject<string>(1);


  constructor() { }

  // //reactive try here

  // loadProject()




  // //reactive trys ende here


  setHeader(value: string) {
    this._header.next(value);
  }

  setUser(value: User) {
    this._loggedInUser.next(value);
  }

  setUserSettings(value: UserSettings) {
    this._userSettings.next(value);
  }

  setProjects(value: Project[]) {
    this._projects.next(value);
  }

  setActiveViewProject(value: Project) {
    this._activeViewProject.next(value);
  }

  setAlmProjects(value: ALMProject[]) {
    this._almprojects.next(value)
  }

  setRemoteProjects(value: RemoteProject[]) {
    this._remoteProjects.next(value);
  }

  //also set the title
  setActiveViewpoint(value: Viewpoint | undefined) {
    this._activeViewpoint.next(value)
    if (value !== undefined) this._activeViewpointTitle.next(value.title)
  }

  setActiveViewpointTitle(value: string) {
    this._activeViewpointTitle.next(value)
  }

  get header() {
    return this._header.asObservable();
  }

  get user() {
    return this._loggedInUser.asObservable();
  }

  get projects() {
    return this._projects.asObservable();
  }

  get userSettings() {
    return this._userSettings.asObservable();
  }

  get activeviewproject() {
    return this._activeViewProject.asObservable();
  }

  get almProjects() {
    return this._almprojects.asObservable();
  }

  get activeViewpoint() {
    return this._activeViewpoint.asObservable();
  }

  get activeViewpointTitle() {
    return this._activeViewpointTitle.asObservable();
  }

  get remoteProjects() {
    return this._remoteProjects.asObservable();
  }

}
