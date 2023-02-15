import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { User } from '@firebase/auth';
import { Project } from '../models/project';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _header = new BehaviorSubject<string>("Software Project Planner")
  private _loggedInUser = new ReplaySubject<User>(1)
  private _projects = new ReplaySubject<Project[]>(1)
  private _activeprojectview = new ReplaySubject<string>(1)
  private _activeViewProject = new ReplaySubject<Project>(1)

  constructor() { }

  setHeader(value: string) {
    this._header.next(value);
  }

  setUser(value: User) {
    this._loggedInUser.next(value);
  }

  setProjects(value: Project[]) {
    this._projects.next(value);
  }

  setActiveProjectView(value: string) {
    this._activeprojectview.next(value);
  }

  setActiveViewProject(value: Project) {
    this._activeViewProject.next(value);
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

  get activeprojectview() {
    return this._activeprojectview.asObservable();
  }

  get activeviewproject() {
    return this._activeViewProject.asObservable();
  }

}