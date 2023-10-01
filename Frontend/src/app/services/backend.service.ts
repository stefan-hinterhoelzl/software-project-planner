import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Project, RemoteProject, Viewpoint, ViewpointLevelLabel } from '../models/project';
import { getAuth } from '@firebase/auth';
import { UserSettings } from '../models/user';
import { Issue, IssueRelation, IssueRelationSettings } from '../models/issue';
import { IssueNode } from '../models/node';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  BASE_URL = '/planner_backend/'; //Used for the Nginx Routing
  private http = inject(HttpClient);

  constructor() {}

  //Users
  handleLogin(user: UserSettings) {
    //Settings are used for now
    //Only important to store the user in the database for the foreign key.
    return this.http.post<UserSettings>(this.BASE_URL + 'users', user);
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

  updateViewpointHierarchySettings(viewpointId: number, projectId: string, labels: ViewpointLevelLabel[]) {
    return this.http.post<any>(this.BASE_URL + 'project/' + projectId + '/viewpoint/' + viewpointId + '/hierarchysettings', labels, {observe: 'body', responseType: 'json'})
  }

  getViewpointHierarchySettings(viewpointId: number, projectId: string) {
    return this.http.get<ViewpointLevelLabel[]>(this.BASE_URL + 'project/' + projectId + '/viewpoint/'+viewpointId + '/hierarchysettings', {observe: 'body', responseType: 'json'});
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

  getRemoteIssuesByIDs(projectId: string, viewpointId: number, remoteIssues: number[]) {
    return this.http.put<Issue[]>(this.BASE_URL + 'project/'+projectId + '/Viewpoint/' + viewpointId + '/GetRemoteIssues' , remoteIssues, {responseType: 'json', observe: 'body'})
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

  issueIsPartofRelation(projectId: string, viewpointId: number, issueId: number): Observable<boolean> {
    return this.http.get<any>(`${this.BASE_URL}project/${projectId}/viewpoint/${viewpointId}/remoteissues/${issueId}/ispartofrelation`, {responseType: 'json', observe: 'body'})
    .pipe(map(body => body.isPart))
  }

  evaluateTree(projectId: string, viewpointId: number, tree: IssueNode[]): Observable<IssueNode[]> {
    return this.http.put<IssueNode[]>(`${this.BASE_URL}project/${projectId}/viewpoint/${viewpointId}/EvaluateTree`, tree, {observe: 'body', responseType: 'json'})
  }

  getAutomaticRelations(settings: IssueRelationSettings, tree: IssueNode[], backlog: IssueNode[]) {
    let passingParemeters: any[] = [tree, backlog, settings]
    return this.http.put<any>(`${this.BASE_URL}project/${settings.projectId}/viewpoint/${settings.viewpointId}/detecthierarchies`, passingParemeters, {observe: 'body', responseType: 'json'})
  }

}
