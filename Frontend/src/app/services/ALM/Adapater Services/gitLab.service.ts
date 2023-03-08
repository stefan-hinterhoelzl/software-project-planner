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
    {headers: new HttpHeaders({'PRIVATE-TOKEN': accesstoken}), observe: 'response'})
  }

  getIssuesPerProject(remoteProjectID: number, accesstoken: string, filterstring: string) {
    console.log(filterstring)
    console.log(accesstoken)
    return this.http.get<any[]>(this.BASE_URL+'projects/'+remoteProjectID+'/issues'+filterstring,
    {headers: new HttpHeaders({'PRIVATE-TOKEN': accesstoken}), observe: 'response', responseType: 'json'})
  }

  getProjectPerID(remoteProjectID: number, accesstoken: string) {
    return this.http.get<any>(this.BASE_URL+'projects/'+remoteProjectID,
    {headers: new HttpHeaders({'PRIVATE-TOKEN': accesstoken}), observe: 'body', responseType: 'json'})
  }

  getLabelsPerProject(remoteProjectID: number, accesstoken: string, paginationstring: string) {
    return this.http.get<any[]>(this.BASE_URL+'projects/'+remoteProjectID+'/labels'+paginationstring,
    {headers: new HttpHeaders({'PRIVATE-TOKEN': accesstoken}), observe: 'response', responseType: 'json'})
  }

}
