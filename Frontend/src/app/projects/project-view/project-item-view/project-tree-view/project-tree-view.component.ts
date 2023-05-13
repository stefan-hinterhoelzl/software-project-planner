import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { NestedTreeControl } from '@angular/cdk/tree';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { combineLatest, forkJoin, map, Observable, of, share, switchMap, tap } from 'rxjs';
import { NewViewpointDialogComponent } from 'src/app/dialogs/new-viewpoint-dialog/new-viewpoint-dialog.component';
import { ALMIssue } from 'src/app/models/alm.models';
import { Issue } from 'src/app/models/issue';
import { DropInfo, IssueNode } from 'src/app/models/node';
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

  nodeLookup = new Map<string, IssueNode>();
  dropActionTodo!: DropInfo;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.aggregator = new GitLabAggregator();
    this.backlog = [];
    this.treeData = [];
  }

  viewpoints$ = this.data.viewpoints$.pipe(share());
  viewpoint$ = this.data.activeViewpoint$.pipe(tap(() => (this.backlogLoading = true)));

  backlog: IssueNode[];
  treeData: IssueNode[];

  treeControl = new NestedTreeControl<IssueNode>(node => node.children);

  hasChild = (_: number, node: IssueNode) => !!node.children && node.children.length > 0;

  project$ = this.data.activeProject$;

  issuesBacklog$ = this.viewpoint$.pipe(
    switchMap(viewpoint => {
      return this.backend.getSelectedRemoteIssuesWithoutRelations(viewpoint?.projectId!, viewpoint?.viewpointId!);
    }),
    switchMap(issues => {
      return this.getALMIssues(issues);
    }),
    tap(issues => {
      //reset on reload
      this.treeData.length = 0;
      this.backlog.length = 0;
      this.nodeLookup.clear();

      //state boolean
      this.backlogLoading = false;

      let alternating = false

      issues.forEach(issue => {
        let node: IssueNode = this.convertALMIssueToNode(issue);
        if (alternating) this.treeData.push(node);
        alternating = !alternating
        this.backlog.push(node);
        this.nodeLookup.set(node.id, node);
      });

      this.prepareDragAndDrop(this.treeData);
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

  prepareDragAndDrop(nodes: IssueNode[]) {
    nodes.forEach(node => {
      this.nodeLookup.set(node.id, node);
      this.prepareDragAndDrop(node.children);
    });
  }

  getALMIssues(issues: Issue[]): Observable<ALMIssue[]> {
    let remoteProjects: RemoteProject[] = this.data.staticRemoteProjects;
    let projectsCopy: RemoteProject[] = JSON.parse(JSON.stringify(remoteProjects)); //Copy to avoid mutable manipulation
    const o_issues = issues.map(issue => {
      let project = projectsCopy.find(value => (value.remoteProjectId = issue.remoteProjectId));
      return this.aggregator.getSingleIssue(project!, issue.remoteIssueId);
    });

    if (o_issues.length === 0) {
      return of([]);
    } else {
      return forkJoin(o_issues).pipe(
        map(ALMIssues => {
          return ALMIssues.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
        })
      );
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

  drop(event: any) {
    const draggedItemId: string = event.item.data;
    const draggedItem = this.nodeLookup.get(draggedItemId);

    //handle empty droplist
    if (this.treeData.length === 0 && draggedItem !== undefined) {
      let index = this.backlog.findIndex((c: IssueNode) => c.id === draggedItemId)
      this.backlog.splice(index, 1)
      this.treeData.push(draggedItem)
      return;
    }

    if (!this.dropActionTodo) return;

    const parentItemId = event.previousContainer.id;
    const targetListId = this.getParentNodeId(this.dropActionTodo.targetId, this.treeData, 'main');

    console.log(
      '\nmoving\n',
      '[' + draggedItemId + '] from list [' + parentItemId + ']',
      '\n[' + this.dropActionTodo.action + ']\n[' + this.dropActionTodo.targetId + '] from list [' + targetListId + ']'
    );

    const oldItemContainer =
      parentItemId !== 'main' ? (parentItemId !== 'node-backlog' ? this.nodeLookup.get(parentItemId)!.children : this.backlog) : this.treeData;
    const newContainer =
      targetListId !== 'main' ? (targetListId !== 'node-backlog' ? this.nodeLookup.get(targetListId)!.children : this.backlog) : this.treeData;

    let i = oldItemContainer.findIndex((c: IssueNode) => c.id === draggedItemId);
    oldItemContainer.splice(i, 1);

    switch (this.dropActionTodo.action) {
      case 'before':
      case 'after':
        const targetIndex = newContainer.findIndex((c: IssueNode) => c.id === this.dropActionTodo.targetId);
        if (this.dropActionTodo.action == 'before') {
          newContainer.splice(targetIndex, 0, draggedItem!);
        } else {
          newContainer.splice(targetIndex + 1, 0, draggedItem!);
        }
        break;

      case 'inside':
        this.nodeLookup.get(this.dropActionTodo.targetId)!.children.push(draggedItem!);
        this.nodeLookup.get(this.dropActionTodo.targetId)!.isExpanded = true;
        break;
    }

    this.clearDragInfo(true);
  }

  dragMoved(event: any) {
    let e = this.document.elementFromPoint(event.pointerPosition.x, event.pointerPosition.y);

    if (!e) {
      this.clearDragInfo();
      return;
    }
    let container = e.classList.contains('node-item') ? e : e.closest('.node-item');
    console.log(container);
    if (!container) {
      this.clearDragInfo();
      return;
    }

    this.dropActionTodo = {
      targetId: container.getAttribute('data-id')!,
    };
    const targetRect = container.getBoundingClientRect();
    const oneThird = targetRect.height / 3;

    if (event.pointerPosition.y - targetRect.top < oneThird) {
      // before
      this.dropActionTodo['action'] = 'before';
    } else if (event.pointerPosition.y - targetRect.top > 2 * oneThird) {
      // after
      this.dropActionTodo['action'] = 'after';
    } else {
      // inside
      this.dropActionTodo['action'] = 'inside';
    }
    console.log(this.dropActionTodo);
    this.showDragInfo();
  }

  getParentNodeId(id: string, nodesToSearch: IssueNode[], parentId: string): string {
    for (let node of nodesToSearch) {
      if (node.id == id) return parentId;
      let ret = this.getParentNodeId(id, node.children, node.id);
      if (ret) return ret;
    }
    return '';
  }

  showDragInfo() {
    this.clearDragInfo();
    if (this.dropActionTodo) {
      this.document.getElementById('node-' + this.dropActionTodo.targetId)!.classList.add('drop-' + this.dropActionTodo.action);
    }
  }

  clearDragInfo(dropped = false) {
    if (dropped) {
      this.dropActionTodo = null!;
    }
    this.document.querySelectorAll('.drop-before').forEach(element => element.classList.remove('drop-before'));
    this.document.querySelectorAll('.drop-after').forEach(element => element.classList.remove('drop-after'));
    this.document.querySelectorAll('.drop-inside').forEach(element => element.classList.remove('drop-inside'));
  }

  convertALMIssueToNode(issue: ALMIssue): IssueNode {
    return <IssueNode>{
      issue: issue,
      children: [],
      id: `${issue.projectId}${issue.issueId}`,
      isExpanded: false,
    };
  }
}
