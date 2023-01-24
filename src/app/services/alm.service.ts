import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ALMService {

  private http = inject(HttpClient)

  BASE_URL = 'https://gitlab.com/api/v4/'

  constructor() { }



  checkForAccessToProject(projectID: string, accesstoken: string) {
    return this.http.get(this.BASE_URL+'projects/'+projectID, {headers: new HttpHeaders({'PRIVATE-TOKEN': accesstoken}), observe: 'response'})
  }

  getAllIssuesOfProject(projectID: string, accesstoken: string) {
    return this.http.get<any[]>(this.BASE_URL+'projects/'+projectID+'/issues', {headers: new HttpHeaders({'PRIVATE-TOKEN': accesstoken}), observe: 'response'})
  }
}
