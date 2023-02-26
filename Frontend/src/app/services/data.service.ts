import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { User } from '@firebase/auth';
import { Project } from '../models/project';
import { UserSettings } from '../models/user';
import { ALMProject } from '../models/alm.models';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _header = new BehaviorSubject<string>("Software Project Planner")
  private _loggedInUser = new ReplaySubject<User>(1)
  private _userSettings = new ReplaySubject<UserSettings>(1)
  private _projects = new ReplaySubject<Project[]>(1)
  private _activeViewProject = new ReplaySubject<Project>(1)
  private _almprojects = new ReplaySubject<ALMProject[]>(1)


  constructor() { }

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

}
