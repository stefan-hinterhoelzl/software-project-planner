import { Injectable } from '@angular/core';
import { ALMFilteroptions, ALMIssue, ALMPaginationoptions, ALMProject } from '../models/alm.models';
import { RemoteProject } from '../models/project';


@Injectable()
export abstract class ALMDataAggregator {

  abstract getProjects(remoteProjects: RemoteProject[]): ALMProject[];

  abstract getIssues(project: RemoteProject, filteroptions?: ALMFilteroptions, paginationoptions?: ALMPaginationoptions): ALMIssue[];

}


@Injectable({
  providedIn: 'root'
})
export class GitLabService implements ALMDataAggregator {

  constructor() { }


  getProjects(remoteProjects: RemoteProject[]): ALMProject[] {
    console.log('I am a Gitlab Method.');
    return []
  }


  getIssues(project: RemoteProject, filteroptions?: ALMFilteroptions | undefined, paginationoptions?: ALMPaginationoptions | undefined): ALMIssue[] {
    throw new Error('Method not implemented.');
  }
}


//Add other aggregators
