import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { combineLatest, forkJoin, map, Observable, of, share, switchMap, tap } from 'rxjs';
import { NewViewpointDialogComponent } from 'src/app/dialogs/new-viewpoint-dialog/new-viewpoint-dialog.component';
import { ALMIssue } from 'src/app/models/alm.models';
import { Issue } from 'src/app/models/issue';
import { IssueNode } from 'src/app/models/node';
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
    this.backlog = []
    this.treeData = []
  }

  viewpoints$ = this.data.viewpoints$.pipe(share());
  viewpoint$ = this.data.activeViewpoint$.pipe(tap(() => this.backlogLoading = true));

  backlog: ALMIssue[];
  treeData: IssueNode[];

  dataSource = new MatTreeNestedDataSource<IssueNode>();

  treeControl = new NestedTreeControl<IssueNode>(node => node.children);

  hasChild = (_: number, node: IssueNode) => !!node.children && node.children.length > 0;

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
      //reset on reload
      this.treeData.length = 0
      this.backlog.length = 0

      this.backlogLoading = false;
      this.backlog.push(...issues)

      //Just testing here
      let node3 = <IssueNode> {
        issue: issues[2],
        children: [],
      }

      let node1 = <IssueNode> {
        issue: issues[0],
        children: [node3],
      }

      let node2 = <IssueNode> {
        issue: issues[1],
        children: [node1],
      }

      let node32 = <IssueNode> {
        issue: issues[5],
        children: [],
      }

      let node12 = <IssueNode> {
        issue: issues[6],
        children: [node32],
      }

      let node22 = <IssueNode> {
        issue: issues[7],
        children: [node12],
      }

      let node33 = <IssueNode> {
        issue: issues[10],
        children: [],
      }

      let node13 = <IssueNode> {
        issue: issues[11],
        children: [node33],
      }

      let node23 = <IssueNode> {
        issue: issues[12],
        children: [node13],
      }




      this.treeData.push(...[node2, node22, node23])

      this.dataSource.data = this.treeData

      console.log(this.treeData)

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
    console.log(event)
    if (event.container.id === "top-level") {
      let item: ALMIssue = this.backlog[event.previousIndex]
      console.log(item)
      let newNode: IssueNode = <IssueNode> {
        issue: item,
        children: []
      }
      console.log(newNode)
      this.treeData.push(newNode)
      this.dataSource.data = this.treeData
    }
  }
}
