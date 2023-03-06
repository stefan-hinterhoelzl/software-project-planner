import { HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, from, lastValueFrom, map, observable, Observable, of, tap } from 'rxjs';
import { ALMFilteroptions, ALMIssue, ALMPaginationoptions, ALMProject } from '../../models/alm.models';
import { RemoteProject } from '../../models/project';
import { GitlabALMService } from './Adapater Services/gitLab.service';

@Injectable()
export abstract class ALMDataAggregator {
  abstract getProjects(remoteProjects: RemoteProject[]): Observable<ALMProject[]>;

  abstract getIssues(project: RemoteProject, filteroptions?: ALMFilteroptions, paginationoptions?: ALMPaginationoptions): Observable<ALMIssue[]>;

  abstract getLabels(project: RemoteProject): Observable<string[]>;
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

  getLabels(project: RemoteProject): Observable<string[]> {
    return from(this.labelsAggregator(project));
  }

  async labelsAggregator(project: RemoteProject) {
    let requests: string[] = [];
    let currentPage: number = 1;

    let pageAmount = this.getLabelsForProject(project, '?per_page=100').pipe(map(res => (totalPages = Number(res.headers.get('x-total-pages')))));
    let totalPages: number = await lastValueFrom(pageAmount);

    while (currentPage <= totalPages) {
      requests.push('?per_page=100&page=' + currentPage);
      currentPage++;
    }

    const o_labels = requests.map((value, index, array) => {
      return this.getLabelsForProject(project, value);
    });

    return lastValueFrom(
      forkJoin(o_labels).pipe(
        map(labels =>
          labels
            .flat()
            .map(label => label.body as string[])
            .flat()
        )
      )
    );
  }

  getLabelsForProject(project: RemoteProject, paginationString: string) {
    const labels: Observable<HttpResponse<any[]>> = this.alm.getLabelsPerProject(project.remoteProjectId, project.accessToken, paginationString);
    return labels;
  }
}

//Add other aggregators
