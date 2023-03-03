import { HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { ALMFilteroptions, ALMIssue, ALMPaginationoptions, ALMProject } from '../../models/alm.models';
import { RemoteProject } from '../../models/project';
import { GitlabALMService } from './Adapater Services/gitLab.service';

@Injectable()
export abstract class ALMDataAggregator {
  abstract getProjects(remoteProjects: RemoteProject[]): Observable<ALMProject[]>;

  abstract getIssues(project: RemoteProject, filteroptions?: ALMFilteroptions, paginationoptions?: ALMPaginationoptions): Observable<ALMIssue[]>;
}

@Injectable({
  providedIn: 'root',
})
export class GitLabAggregator implements ALMDataAggregator {
  constructor() {}

  alm = inject(GitlabALMService);

  getProjects(remoteProjects: RemoteProject[]): Observable<ALMProject[]> {
    const o_projects: Observable<ALMProject>[] = remoteProjects.map(project =>
      this.alm.getProjectPerID(project.remoteProjectId, project.accessToken).pipe(
        map(project => {
          return <ALMProject>{
            projectId: project.id,
            title: project.name,
            description: project.description,
            createdAt: project.created_at,
            updatedAt: project.last_activity_at,
            webURL: project.web_url,
          };
        })
      )
    );

    return forkJoin(o_projects);
  }

  getIssues(
    project: RemoteProject,
    filteroptions?: ALMFilteroptions | undefined,
    paginationoptions?: ALMPaginationoptions | undefined
  ): Observable<ALMIssue[]> {
    throw new Error('Method not implemented.');
  }
}

//Add other aggregators
