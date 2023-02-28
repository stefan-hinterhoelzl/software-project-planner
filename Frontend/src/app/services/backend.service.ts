import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { Project, RemoteProject, Viewpoint } from '../models/project';
import { DataService } from './data.service';
import { getAuth, User } from '@firebase/auth';
import { UserSettings } from '../models/user';
import { SnackbarComponent } from '../snackbar/snackbar.component';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  BASE_URL = 'http://localhost:3000/';
  private data = inject(DataService);
  private http = inject(HttpClient);
  private snackbar = inject(SnackbarComponent);

  constructor() {}

  //Users

  getUserData() {
    const auth = getAuth();
    this.http.get<UserSettings>(this.BASE_URL + 'user/' + auth.currentUser?.uid).subscribe({
      next: userSettings => {
        this.data.setUserSettings(userSettings);
      },
      error: error => {
        this.snackbar.openSnackBar('Error loading user settings! Try again later.', 'red-snackbar');
        console.log(error.error);
      },
    });
  }

  updateUserData(value: UserSettings) {
    //TODO
  }

  //Projects

  addProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.BASE_URL + 'projects', project);
  }

  getProjects() {
    const auth = getAuth();
    this.http.get<Project[]>(this.BASE_URL + 'projects/' + auth.currentUser?.uid).subscribe({
      next: projects => {
        this.data.setProjects(projects);
      },
      error: error => {
        this.snackbar.openSnackBar('Error loading projects! Try again later.', 'red-snackbar');
        console.log(error.error);
      },
    });
  }

  //Remoteprojects
  addRemoteProjectsToProject(projectId: string, remoteProjects: RemoteProject[]): Observable<RemoteProject[]> {
    return this.http.post<RemoteProject[]>(this.BASE_URL + 'project/' + projectId + '/RemoteProjects', remoteProjects);
  }

  getRemoteProjectsForProject(projectId: string) {
    return this.http.get<RemoteProject[]>(this.BASE_URL + 'project/' + projectId + '/RemoteProjects');
  }

  //Viewpoints
  addViewpointToProject(projectId: string, viewPoint: Viewpoint) {
    return this.http.post<Viewpoint>(this.BASE_URL + 'project/' + projectId + '/Viewpoints', viewPoint);
  }

  getViewpointsFromProject(projectId: string) {
    return this.http.get<Viewpoint[]>(this.BASE_URL + 'project/' + projectId + '/Viewpoints')
  }

  getViewpointByID(viewpointId: number, projectId: string) {
    return this.http.get<Viewpoint>(this.BASE_URL + 'project/' + projectId + '/Viewpoint/' + viewpointId)
  }

}
