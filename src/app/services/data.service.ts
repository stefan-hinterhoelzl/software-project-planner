import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _header = new BehaviorSubject<string>("Software Project Planner")

  constructor() { }

  setHeader(value: string) {
    this._header.next(value);
  }

  get header() {
    return this._header.asObservable();
  }

}
