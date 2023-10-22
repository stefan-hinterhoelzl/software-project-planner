import { HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, from, lastValueFrom, map,  Observable, of } from 'rxjs';
import { ALMFilteroptions, ALMIssue, ALMIssueResWrapper, ALMPaginationoptions, ALMProject, ALMTimeStats } from '../../models/alm.models';
import { RemoteProject } from '../../models/project';
import { GitlabALMService } from './Adapater Services/gitLab.service';
import { IssueNode } from 'src/app/models/node';
import { IssueLink } from 'src/app/models/issue';

@Injectable()
export abstract class ALMDataAggregator {


  abstract checkForAccessToProject(remoteProjectId: number, accessToken: string): Observable<any>;

  abstract getProjects(remoteProjects: RemoteProject[]): Observable<ALMProject[]>;

  abstract getIssues(
    project: RemoteProject,
    filteroptions?: ALMFilteroptions,
    paginationoptions?: ALMPaginationoptions
  ): Observable<ALMIssueResWrapper>;

  abstract getSingleIssue(remoteProject: RemoteProject, issueId: number): Observable<ALMIssue>;

  abstract getLabels(project: RemoteProject): Observable<string[]>;

  abstract getIssueLinks(
    tree: IssueNode[],
    backlog: IssueNode[],
    remoteProjects: RemoteProject[]
  ): Observable<IssueLink[]>;
}

@Injectable({
  providedIn: 'root',
})
export class GitLabAggregator implements ALMDataAggregator {
  constructor() {}

  alm = inject(GitlabALMService);

  checkForAccessToProject(remoteProjectId: number, accessToken: string): Observable<any> {
      return this.alm.checkForAccessToProject(remoteProjectId, accessToken)
  }

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
  ): Observable<ALMIssueResWrapper> {
    let filterString = '';
    let paginationString = '';

    if (filteroptions !== undefined) filterString = this.createFilterString(filteroptions);
    if (paginationoptions !== undefined) paginationString = this.createPaginationString(paginationoptions, filterString);

    let optionsString = filterString.concat(paginationString);

    return this.alm.getIssuesPerProject(project.remoteProjectId, project.accessToken, optionsString).pipe(
      map(res => {
        return <ALMIssueResWrapper>{
          totalitems: Number(res.headers.get('x-total')),
          totalpages: Number(res.headers.get('x-total-pages')),
          issues: res.body?.map(issue => {
            return <ALMIssue>{
              projectId: issue.project_id,
              issueId: issue.iid,
              title: issue.title,
              description: issue.description,
              labels: issue.labels,
              createdAt: issue.created_at,
              updatedAt: issue.updated_at,
              dueDate: issue.due_date,
              state: issue.state,
              type: issue.type,
              webURL: issue.web_url,
              timeStats: <ALMTimeStats>{
                estimateHours: issue.time_stats.time_estimate,
                spentHours: issue.time_stats.total_time_spent,
              },
              selected: false,
            };
          }),
        };
      })
    );
  }

  getSingleIssue(project: RemoteProject, issueId: number) {
    return this.alm.getIssueById(project.remoteProjectId, project.accessToken, issueId).pipe(
      map(issue => {
        return <ALMIssue>{
          projectId: issue.project_id,
          issueId: issue.iid,
          title: issue.title,
          description: issue.description,
          labels: issue.labels,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          dueDate: issue.due_date,
          closedAt: issue.closed_at,
          state: issue.state,
          type: issue.type,
          webURL: issue.web_url,
          timeStats: <ALMTimeStats>{
            estimateHours: Math.round((issue.time_stats.time_estimate / 3600) *100) / 100,
            spentHours: Math.round((issue.time_stats.total_time_spent / 3600) *100) / 100,
          },
          selected: true,
        };
      })
    );
  }

  private createFilterString(filter: ALMFilteroptions): string {
    let filterstring: string = '';
    let searchterm = filter.titleDescription;
    let selectedLabels = filter.labels;
    let selectedState = filter.state;
    let selectedStartDate = filter.updatedAfter;
    let selectedEndDate = filter.updatedBefore;

    if (searchterm !== '') filterstring = filterstring.concat('?search=', searchterm);
    if (selectedLabels?.length !== 0) {
      if (filterstring.indexOf('?') === -1) filterstring = filterstring.concat('?labels=');
      else filterstring = filterstring.concat('&labels=');
      selectedLabels?.forEach(value => {
        filterstring = filterstring.concat(value, ',');
      });
      filterstring = filterstring.substring(0, filterstring.length - 1);
    }
    if (selectedState !== '') {
      if (filterstring.indexOf('?') === -1) filterstring = filterstring.concat('?state=');
      else filterstring = filterstring.concat('&state=');

      filterstring = filterstring.concat(selectedState);
    }

    if (selectedEndDate !== '' && selectedStartDate !== '') {
      let startDate: string = new Date(selectedStartDate).toISOString();
      let endDate: string = new Date(selectedEndDate).toISOString();

      if (filterstring.indexOf('?') === -1) filterstring = filterstring.concat('?updated_after=');
      else filterstring = filterstring.concat('&updated_after=');

      filterstring = filterstring.concat(startDate);
      filterstring = filterstring.concat('&update_before' + endDate);
    }

    return filterstring;
  }

  private createPaginationString(pagination: ALMPaginationoptions, filterstring: string): string {
    let paginationString: string = '';
    if (filterstring.indexOf('?') === -1) paginationString = paginationString.concat('?');
    else paginationString = paginationString.concat('&');
    paginationString = paginationString.concat('page=', (pagination.page! + 1).toString()); //Angular starts at 0, Gitlab at one
    paginationString = paginationString.concat('&per_page=', pagination.perPage!.toString());

    return paginationString;
  }

  getLabels(project: RemoteProject): Observable<string[]> {
    return from(this.labelsAggregator(project));
  }

  private async labelsAggregator(project: RemoteProject) {
    let requests: string[] = [];
    let currentPage: number = 1;
    let p: number;

    let pageAmount = this.getLabelsForProject(project, '?per_page=100').pipe(map(res => (p = Number(res.headers.get('x-total-pages')))));
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
            .map(label => label.body)
            .flat()
            .map(value => value.name)
        )
      )
    );
  }

  getIssueLinks(
    treeNodes: IssueNode[],
    backlogNodes: IssueNode[],
    remoteProjects: RemoteProject[]
  ): Observable<IssueLink[]> {
    let combinedNodes: IssueNode[] = [...treeNodes, ...backlogNodes];

    const o_relations = combinedNodes.map((value, index, array) => {
      let remoteProject = remoteProjects.find(project => project.remoteProjectId === value.issue.projectId);
      if (remoteProject != undefined) return this.getRelationsForIssues(value, remoteProject);
      return of<IssueLink[]>([])
    });


    if (o_relations.length !== 0) return forkJoin(o_relations).pipe(map(relations => relations.flat()));
    else return of<IssueLink[]>([]);
  }

  private getLabelsForProject(project: RemoteProject, paginationString: string) {
    const labels: Observable<HttpResponse<any[]>> = this.alm.getLabelsPerProject(project.remoteProjectId, project.accessToken, paginationString);
    return labels;
  }

  private getRelationsForIssues(issue: IssueNode, remoteProject: RemoteProject) {
    const relations: Observable<IssueLink[]> = this.alm
      .getIssueRelations(remoteProject.remoteProjectId, remoteProject.accessToken, issue.issue.issueId)
      .pipe(
        map(relations => {
          return relations.map(relation => {
            return <IssueLink>{
              remoteprojectId: issue.issue.projectId,
              remoteIssueId: issue.issue.issueId,
              relatedRemoteProjectId: relation.project_id,
              relatedRemoteIssueId: relation.iid,
            };
          });
        })
      );
    return relations;
  }
}
