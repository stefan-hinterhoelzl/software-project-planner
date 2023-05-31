import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import { Project, RemoteProject, Viewpoint } from '../models/project';
import { DataService } from './data.service';
import { getAuth, User } from '@firebase/auth';
import { UserSettings } from '../models/user';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { ALMIssue } from '../models/alm.models';
import { Issue, IssueRelation } from '../models/issue';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  BASE_URL = 'http://localhost:3000/';
  //private data = inject(DataService);
  private http = inject(HttpClient);
  private snackbar = inject(SnackbarComponent);

  constructor() {}

  //Users

  // getUserData() {
  //   const auth = getAuth();
  //   this.http.get<UserSettings>(this.BASE_URL + 'user/' + auth.currentUser?.uid).subscribe({
  //     next: userSettings => {
  //       this.data.setUserSettings(userSettings);
  //     },
  //     error: error => {
  //       this.snackbar.openSnackBar('Error loading user settings! Try again later.', 'red-snackbar');
  //       console.log(error.error);
  //     },
  //   });
  // }

  updateUserData(value: UserSettings) {
    //TODO
  }

  //Projects

  addProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.BASE_URL + 'projects', project);
  }

  getProjects(): Observable<Project[]> {
    const auth = getAuth();
    return this.http.get<Project[]>(this.BASE_URL + 'projects/' + auth.currentUser?.uid);
  }

  getProjectById(projectId: string): Observable<Project> {
    return this.http.get<Project>(this.BASE_URL + 'project/' + projectId)
  }

  updateProjectById(project: Project): Observable<Project> {
    return this.http.put<Project>(this.BASE_URL + 'project/' + project.projectId, project, {observe: 'body', responseType: 'json'});
  }

  deleteProjectById(project: Project) {
    return this.http.delete(this.BASE_URL + 'project/'+ project.projectId)
  }

  //Remoteprojects
  addRemoteProjectsToProject(projectId: string, remoteProjects: RemoteProject[]): Observable<RemoteProject[]> {
    return this.http.post<RemoteProject[]>(this.BASE_URL + 'project/' + projectId + '/RemoteProjects', remoteProjects);
  }

  getRemoteProjectsForProject(projectId: string): Observable<RemoteProject[]> {
    return this.http.get<RemoteProject[]>(this.BASE_URL + 'project/' + projectId + '/RemoteProjects', {observe: 'body', responseType: 'json'});
  }

  updateRemoteProjectFromProject(project: Project, remoteProjects: RemoteProject[]) {
    return this.http.put(this.BASE_URL + 'project/' + project.projectId + '/RemoteProjects', remoteProjects, {observe: 'body', responseType: 'json'})
  }

  //Viewpoints
  addViewpointToProject(projectId: string, viewPoint: Viewpoint): Observable<Viewpoint> {
    return this.http.post<Viewpoint>(this.BASE_URL + 'project/' + projectId + '/Viewpoints', viewPoint, {observe: 'body', responseType: 'json'});
  }

  getViewpointsFromProject(projectId: string) {
    return this.http.get<Viewpoint[]>(this.BASE_URL + 'project/' + projectId + '/Viewpoints')
  }

  getViewpointByID(viewpointId: number, projectId: string) {
    return this.http.get<Viewpoint>(this.BASE_URL + 'project/' + projectId + '/Viewpoint/' + viewpointId)
  }

  updateViewpointByID(viewpointId: number, projectId: string, viewpoint: Viewpoint) {
    return this.http.put<Viewpoint>(this.BASE_URL + 'project/' + projectId + '/Viewpoint/' + viewpointId, viewpoint, {observe: 'body', responseType: 'json'});
  }

  deleteViewpointById(viewpoint: Viewpoint) {
    return this.http.delete(this.BASE_URL + 'project/' + viewpoint.projectId + '/Viewpoints/'+viewpoint.viewpointId)
  }

  //Selected Remote Issues
  getSelectedRemoteIssuesForViewpointAndRemoteProject(projectId: string, viewpointId: number, remoteProjectId: number = -1) {
    return this.http.get<Issue[]>(this.BASE_URL + 'project/' + projectId + '/Viewpoint/' + viewpointId + '/RemoteIssues', {params: {'remoteProjectId':remoteProjectId}})
  }

  getSelectedRemoteIssuesWithoutRelations(projectId: string, viewpointId: number) {
    return this.http.get<Issue[]>(this.BASE_URL + 'project/' + projectId + '/Viewpoint/' + viewpointId + '/RemoteIssuesWithoutRelation' , {responseType: 'json'})
  }

  getSelectedRemoteIssueRelations(projectId: string, viewpointId: number) {
    return this.http.get<IssueRelation[]>(this.BASE_URL + 'project/' + projectId + '/Viewpoint/' + viewpointId + '/RemoteIssues/Relations', {responseType: 'json'})
  }

  deleteSelectedRemoteIssueRelations(projectId: string, viewpointId: number) {
    return this.http.delete<IssueRelation[]>(this.BASE_URL + 'project/' + projectId + '/Viewpoint/' + viewpointId + '/RemoteIssues/Relations', {responseType: 'json'})
  }

  addSelectedRemoteIssueRelations(projectId: string, viewpointId: number, relations: IssueRelation[]) {
    return this.http.post<IssueRelation[]>(this.BASE_URL + 'project/' + projectId + '/Viewpoint/' + viewpointId + '/RemoteIssues/Relations', relations, {responseType: 'json'})
  }

  addRemoteIssuesToViewpoint(rIssues: Issue[]) {
    return this.http.post<Issue[]>(this.BASE_URL + 'project/' + rIssues[0].projectId + '/Viewpoint/' + rIssues[0].viewpointId + '/RemoteIssues', rIssues)
  }

  removeRemoteIssuesToViewpoint(rIssues: Issue[]) {
    return this.http.put<Issue[]>(this.BASE_URL + 'project/' + rIssues[0].projectId + '/Viewpoint/' + rIssues[0].viewpointId + '/RemoteIssues', rIssues)
  }

  removeRemoteIssuesByRemoteProject(remoteProject: RemoteProject) {
    return this.http.delete(this.BASE_URL + 'project/' + remoteProject.projectId + '/RemoteProject/' + remoteProject.remoteProjectId + "/RemoteIssues")
  }


}
