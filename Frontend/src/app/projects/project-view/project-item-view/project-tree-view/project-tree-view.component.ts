import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { combineLatest, concat, EMPTY, forkJoin, map, merge, mergeMap, Observable, of, share, shareReplay, switchMap, tap } from 'rxjs';
import { NewViewpointDialogComponent } from 'src/app/dialogs/new-viewpoint-dialog/new-viewpoint-dialog.component';
import { ALMIssue } from 'src/app/models/alm.models';
import { Issue } from 'src/app/models/issue';
import { RemoteProject, Viewpoint } from 'src/app/models/project';
import { ALMDataAggregator, GitLabAggregator } from 'src/app/services/ALM/alm-data-aggregator.service';
import { BackendService } from 'src/app/services/backend.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-project-tree-view',
  templateUrl: './project-tree-view.component.html',
  styleUrls: ['./project-tree-view.component.scss'],
})
export class ProjectTreeViewComponent implements OnInit, OnDestroy {
  data = inject(DataService);
  backend = inject(BackendService);
  dialog = inject(MatDialog);
  aggregator: ALMDataAggregator;

  //State Booleans
  backlogLoading: boolean = false;

  constructor() {
    this.aggregator = new GitLabAggregator();
  }

  viewpoints$ = this.data.viewpoints$.pipe(share());
  viewpoint$ = this.data.activeViewpoint$.pipe(tap(() => this.backlogLoading = true));

  backlog!: ALMIssue[];

  project$ = this.data.activeProject$;

  issuesBacklog$ = this.viewpoint$.pipe(
    switchMap(viewpoint => {
      return this.backend.getSelectedRemoteIssuesWithoutRelations(viewpoint?.projectId!, viewpoint?.viewpointId!);
    }),
    switchMap(issues => {
      console.log(issues)
      return this.getALMIssues(issues)
    }),
    tap(issues => {
      this.backlogLoading = false;
      this.backlog = issues
    })
  );

  // issuesBacklog$ = this.viewpoint$.pipe(
  //   tap(viewpoint => console.log(viewpoint)),
  //   switchMap(viewpoint => {
  //     console.log(viewpoint)
  //     return this.data.getSelectedIssuesForViewpoint(viewpoint!.viewpointId!);
  //   }),
  //   switchMap(issues => {
  //     let remoteProjects: RemoteProject[] = this.data.staticRemoteProjects;
  //     let projectsCopy: RemoteProject[] = JSON.parse(JSON.stringify(remoteProjects)); //Copy to avoid mutable manipulation
  //     const o_issues = issues.map(issue => {
  //       let project = projectsCopy.find(value => (value.remoteProjectId = issue.remoteProjectId));
  //       return this.aggregator.getSingleIssue(project!, issue.remoteIssueId);
  //     });

  //     if (o_issues.length === 0) {
  //       return of([]);
  //     } else {
  //       return forkJoin(o_issues);
  //     }
  //   }),
  //   tap(issues => {
  //     console.log(issues)
  //     this.backlog = issues
  //     this.backlog.sort((a, b) => a.updatedAt > b.updatedAt?-1:1)
  //     this.issuesLoading = false;
  //   })
  // );

  view$ = combineLatest([this.project$, this.viewpoints$]).pipe(share());

  ngOnDestroy(): void {}

  ngOnInit(): void {}

  getALMIssues(issues: Issue[]):Observable<ALMIssue[]> {
    let remoteProjects: RemoteProject[] = this.data.staticRemoteProjects;
    let projectsCopy: RemoteProject[] = JSON.parse(JSON.stringify(remoteProjects)); //Copy to avoid mutable manipulation
    const o_issues = issues.map(issue => {
      let project = projectsCopy.find(value => (value.remoteProjectId = issue.remoteProjectId));
      return this.aggregator.getSingleIssue(project!, issue.remoteIssueId);
    });

    if (o_issues.length === 0) {
      return of([]);
    } else {
      return forkJoin(o_issues).pipe(map(ALMIssues => {
        return ALMIssues.sort((a, b) => a.updatedAt > b.updatedAt?-1:1)
      }));
    }
  }

  createViewpoint(projectId: string, viewpoints: Viewpoint[]) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(NewViewpointDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((data: string) => {
      if (data !== undefined) {
        const newViewpoint = <Viewpoint>{
          title: data,
        };

        this.data.addViewpoint(projectId, newViewpoint, viewpoints);
      }
    });
  }

  chooseViewpoint(viewpoint: Viewpoint) {
    if (viewpoint.viewpointId !== undefined) {
      this.backlogLoading = true;
      this.data.setActiveViewpoint(viewpoint.viewpointId);
    }
  }

  drop(event: CdkDragDrop<ALMIssue[]>) {
    moveItemInArray(this.backlog, event.previousIndex, event.currentIndex);
  }
}
