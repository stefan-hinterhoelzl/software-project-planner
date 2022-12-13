import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { User } from '@firebase/auth';


@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _header = new BehaviorSubject<string>("Software Project Planner")
  private _loggedInUser = new ReplaySubject<User>(1)

  constructor() { }

  setHeader(value: string) {
    this._header.next(value);
  }

  setUser(value: User) {
    this._loggedInUser.next(value);
  }

  get header() {
    return this._header.asObservable();
  }

  get user() {
    return this._loggedInUser.asObservable();
  }

}
