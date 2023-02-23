import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { Project } from '../models/project';
import { DataService } from './data.service';
import { getAuth, User} from '@firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  BASE_URL = "http://localhost:3000/"
  private data = inject(DataService)
  private http = inject(HttpClient)

  constructor() { }


addProject(project: Project): Observable<Project> {
  return this.http.post<Project>(this.BASE_URL+"projects", project)
}

getProjects() {
  const auth = getAuth()
  this.http.get<Project[]>(this.BASE_URL+"projects/"+auth.currentUser?.uid).pipe(take(1)).subscribe(projects => {
    this.data.setProjects(projects)
  });
}




}
