import { HttpClient, HttpHeaders, HttpParams, HttpParamsOptions } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ALMProject } from 'src/app/models/alm.models';

@Injectable({
  providedIn: 'root'
})
export class GitlabALMService {

  private http = inject(HttpClient)

  BASE_URL = 'https://gitlab.com/api/v4/'
  //BASE_URL = 'https://sourcery.im.jku.at/api/v4/'

  constructor() { }



  checkForAccessToProject(remoteProjectID: number, accesstoken: string) {
    return this.http.get(this.BASE_URL+'projects/'+remoteProjectID,
    {headers: this.createHeader(accesstoken), observe: 'response'})
  }

  getIssuesPerProject(remoteProjectID: number, accesstoken: string, filterstring: string) {
    return this.http.get<any[]>(this.BASE_URL+'projects/'+remoteProjectID+'/issues'+filterstring,
    {headers: this.createHeader(accesstoken), observe: 'response', responseType: 'json'})
  }

  getProjectPerID(remoteProjectID: number, accesstoken: string) {
    return this.http.get<any>(this.BASE_URL+'projects/'+remoteProjectID,
    {headers: this.createHeader(accesstoken), observe: 'body', responseType: 'json'})
  }

  getLabelsPerProject(remoteProjectID: number, accesstoken: string, paginationstring: string) {
    return this.http.get<any[]>(this.BASE_URL+'projects/'+remoteProjectID+'/labels'+paginationstring,
    {headers: this.createHeader(accesstoken), observe: 'response', responseType: 'json'})
  }

  getIssueById(remoteProjectID: number, accesstoken: string, issueid: number) {
    return this.http.get<any>(this.BASE_URL+'projects/'+remoteProjectID+'/issues/'+issueid,
    {headers: this.createHeader(accesstoken), observe: 'body', responseType: 'json'})
  }

  getIssueRelations(remoteProjectID: number, accesstoken: string, remoteIssueId: number) {
    return this.http.get<any[]>(this.BASE_URL+'projects/'+remoteProjectID+'/issues/'+remoteIssueId+'/links',
    {headers: this.createHeader(accesstoken), observe: 'body', responseType: 'json'})
  }


  private createHeader(accesstoken: string) {
    let headers = new HttpHeaders()

    if (accesstoken !== '') headers = headers.append('PRIVATE-TOKEN', accesstoken)

    return headers
  }
}
