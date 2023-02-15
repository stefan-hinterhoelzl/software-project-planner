import { HttpClient, HttpHeaders, HttpParams, HttpParamsOptions } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ALMService {

  private http = inject(HttpClient)

  BASE_URL = 'https://gitlab.com/api/v4/'
  //BASE_URL = 'https://sourcery.im.jku.at/api/v4/'

  constructor() { }



  checkForAccessToProject(projectID: number, accesstoken: string) {
    return this.http.get(this.BASE_URL+'projects/'+projectID,
    {headers: new HttpHeaders({'PRIVATE-TOKEN': accesstoken}), observe: 'response'})
  }

  getIssuesPerProject(projectID: number, accesstoken: string, filterstring: string) {
    return this.http.get<any[]>(this.BASE_URL+'projects/'+projectID+'/issues'+filterstring,
    {headers: new HttpHeaders({'PRIVATE-TOKEN': accesstoken}), observe: 'response'})
  }

  getProjectPerID(projectID: number, accesstoken: string) {
    return this.http.get<any>(this.BASE_URL+'projects/'+projectID,
    {headers: new HttpHeaders({'PRIVATE-TOKEN': accesstoken}), observe: 'response'})
  }

  getLabelsPerProject(projectID: number, accesstoken: string, paginationstring: string) {
    return this.http.get<any[]>(this.BASE_URL+'projects/'+projectID+'/labels'+paginationstring,
    {headers: new HttpHeaders({'PRIVATE-TOKEN': accesstoken}), observe: 'response'})
  }


  private createAuthHeader(accesstoken: string) {
    return new HttpHeaders({'PRIVATE-TOKEN': accesstoken})
  }

}
