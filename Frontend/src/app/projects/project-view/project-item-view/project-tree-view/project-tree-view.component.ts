import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
  combineLatest,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  forkJoin,
  map,
  Observable,
  of,
  share,
  shareReplay,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { AreYouSureDialogComponent } from 'src/app/dialogs/are-you-sure-dialog/are-you-sure-dialog.component';
import { NodeBacklogDetailDialogComponent } from 'src/app/dialogs/node-backlog-detail-dialog/node-backlog-detail-dialog.component';
import { NodeTreeDetailDialogComponent } from 'src/app/dialogs/node-tree-detail-dialog/node-tree-detail-dialog.component';
import { ALMIssue } from 'src/app/models/alm.models';
import { ErrorType, Issue, IssueErrorObject, IssueJSONCheckObject, IssueRelation, IssueRelationSettings } from 'src/app/models/issue';
import { DropInfo, IssueNode } from 'src/app/models/node';
import { RemoteProject } from 'src/app/models/project';
import { ALMDataAggregator, GitLabAggregator } from 'src/app/services/ALM/alm-data-aggregator.service';
import { BackendService } from 'src/app/services/backend.service';
import { CanComponentDeactivate } from 'src/app/services/can-deactivate-guard.service';
import { DataService } from 'src/app/services/data.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';

@Component({
  selector: 'app-project-tree-view',
  templateUrl: './project-tree-view.component.html',
  styleUrls: ['./project-tree-view.component.scss'],
})
export class ProjectTreeViewComponent implements CanComponentDeactivate, OnDestroy {
  data = inject(DataService);
  backend = inject(BackendService);
  dialog = inject(MatDialog);
  snackbar = inject(SnackbarComponent);
  cd = inject(ChangeDetectorRef);
  aggregator: ALMDataAggregator;

  //State Booleans
  backlogLoading: boolean = false;
  treeLoading: boolean = false;
  itemMoved: boolean = false;

  nodeLookup = new Map<string, IssueNode>();
  dropActionTodo!: DropInfo;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.aggregator = new GitLabAggregator();
    this.backlog = [];
    this.treeData = [];
    this.filteredBacklog = [];
    this.relationsSave = [];
    this.treeDataSaveState = '';
  }

  viewpoints$ = this.data.viewpoints$.pipe(share());
  viewpoint$ = this.data.activeViewpoint$.pipe(
    delay(0), //help the change detection by moving the execution into the next cycle
    tap(() => {
      this.nodeLookup.clear();
    }),
    shareReplay()
  );

  backlog: IssueNode[];
  filteredBacklog: IssueNode[];
  treeData: IssueNode[];
  treeDataSaveState: string;

  settingsSubscription!: Subscription;

  relationsSave: IssueRelation[];

  project$ = this.data.activeProject$;

  filterControl = new FormControl();

  filterGroup = new FormGroup({
    filterControl: this.filterControl,
  });

  filter = this.filterControl.valueChanges
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(value => {
        this.filteredBacklog.length = 0;
        this.filteredBacklog.push(...this.backlog.filter(val => val.issue.title.toLowerCase().includes(value.toLowerCase())));
      })
    )
    .subscribe();

  hierarchySettings$ = this.viewpoint$.pipe(
    switchMap(viewpoint => {
      return this.data.getHierarchySettings(viewpoint?.viewpointId!, viewpoint?.projectId!);
    })
  );

  issuesBacklog$ = this.viewpoint$.pipe(
    tap(() => {
      this.backlogLoading = true;
      this.backlog.length = 0;
      this.filteredBacklog.length = 0;
    }),
    switchMap(viewpoint => {
      return this.backend.getSelectedRemoteIssuesWithoutRelations(viewpoint?.projectId!, viewpoint?.viewpointId!);
    }),
    switchMap(issues => {
      return this.getALMIssues(issues).pipe(map(ALMIssues => ({ issues, ALMIssues })));
    }),
    tap(issues => {
      issues.ALMIssues.forEach(ALMIssue => {
        let issue: Issue = issues.issues.find(val => val.remoteIssueId === ALMIssue.issueId && val.remoteProjectId === ALMIssue.projectId)!;
        if (issue !== undefined) {
          let node: IssueNode = this.convertALMIssueToNode(ALMIssue, issue);
          this.backlog.push(node);
          this.filteredBacklog.push(node);
          if (!this.nodeLookup.get(node.id)) this.nodeLookup.set(node.id, node);
        }
      });

      //state boolean
      this.backlogLoading = false;
    }),
    share()
  );

  issuesRelation$ = this.viewpoint$.pipe(
    tap(() => {
      this.treeLoading = true;
      this.treeData.length = 0;
    }),
    switchMap(viewpoint => {
      return this.backend.getSelectedRemoteIssueRelations(viewpoint?.projectId!, viewpoint?.viewpointId!);
    }),
    filter(relations => relations !== undefined),
    switchMap(relations => {
      const ids: number[] = [];

      relations.forEach(value => {
        if (ids.find(id => id === value.parentIssueId) === undefined) ids.push(value.parentIssueId);
        if (ids.find(id => id === value.childIssueId) === undefined) ids.push(value.childIssueId);
      });

      let viewpoint = this.data.staticActiveViewpoint;
      let project = this.data.staticProject;

      return this.backend.getRemoteIssuesByIDs(project, viewpoint, ids).pipe(map(res => ({ res, relations })));
    }),
    switchMap(data => {
      return this.getALMIssues(data.res).pipe(map(values => ({ values, data })));
    }),
    tap(data => {
      let arr: IssueNode[] = [];
      data.values.forEach(ALMIssue => {
        let currIndex: number = data.data.relations.findIndex(
          val => val.childIssueId === ALMIssue.issueId && val.childRemoteProjectId === ALMIssue.projectId
        );
        let order: number = data.data.relations[currIndex].nodeOrder;
        let issue: Issue = data.data.res.find(iss => iss.remoteIssueId === ALMIssue.issueId && iss.remoteProjectId === ALMIssue.projectId)!;
        let node: IssueNode = this.convertALMIssueToNode(ALMIssue, issue, order);
        if (arr.findIndex(currNode => currNode.id === node.id) === -1) arr.push(node);
      });

      //prepare the nodes before
      this.prepareDragAndDrop(arr);

      this.buildHierarchy(
        data.data.relations.filter(value => value.parentIssueId === value.childIssueId && value.parentRemoteProjectId === value.childRemoteProjectId),
        data.data.relations
      );

      //sort all the items accordingly
      this.sortArray(this.treeData);

      //create Savestate
      this.treeDataSaveState = this.createJSONTree(this.treeData);

      //state boolean
      this.treeLoading = false;

      //evaluate Tree on first load if tree is not empty
      if(this.treeData.length !== 0) this.evaluateTree(this.treeData);
    }),
    share()
  );

  view$ = combineLatest([this.project$, this.viewpoints$]).pipe(share());
  loaded$ = combineLatest([this.issuesRelation$, this.issuesBacklog$]);

  ngOnDestroy(): void {
    if (this.settingsSubscription !== undefined) this.settingsSubscription.unsubscribe();
  }

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (this.itemMoved) {
      const dialogConfigKeep = new MatDialogConfig();

      dialogConfigKeep.data = {
        title: 'Unsaved Changes!',
        content: 'You have unsaved changes in the hierarchy. They are lost when you leave the page!.',
        button1: 'Discard Changes',
        button2: 'Save Changes',
      };

      dialogConfigKeep.disableClose = true;

      const dialogRef = this.dialog.open(AreYouSureDialogComponent, dialogConfigKeep);
      return dialogRef.afterClosed().pipe(
        switchMap(result => {
          if (!result) {
            this.saveRelations();
          }
          return of(true);
        })
      );
    } else return of(true);
  }

  prepareDragAndDrop(nodes: IssueNode[]) {
    nodes.forEach(node => {
      if (!this.nodeLookup.get(node.id)) this.nodeLookup.set(node.id, node); //avoid duplicate entries
      this.prepareDragAndDrop(node.children);
    });
  }

  placeChildreninTree(searchID: string, child: IssueNode, parent: IssueNode, nodes: IssueNode[]) {
    nodes.forEach(node => {
      if (node.id === searchID) {
        node.children.push(child);
        node.parent = parent;
      } else this.placeChildreninTree(searchID, child, node, node.children);
    });
  }

  sortArray(nodes: IssueNode[]) {
    nodes.sort((a, b) => a.nodeOrder! - b.nodeOrder!);
    nodes.forEach(value => {
      if (value.children.length !== 0) this.sortArray(value.children);
    });
  }

  buildHierarchy(startRelations: IssueRelation[], allRelations: IssueRelation[]) {
    startRelations.forEach(value => {
      let parentID: string = `${value.parentRemoteProjectId}${value.parentIssueId}`;
      let childID: string = `${value.childRemoteProjectId}${value.childIssueId}`;
      if (value.parentIssueId === value.childIssueId && value.parentRemoteProjectId === value.childRemoteProjectId) {
        this.treeData.push(this.nodeLookup.get(childID)!);
      } else {
        this.placeChildreninTree(childID, this.nodeLookup.get(childID)!, this.nodeLookup.get(parentID)!, this.treeData);
        this.nodeLookup.get(parentID)?.children.push(this.nodeLookup.get(childID)!);
      }
      let newRelations: IssueRelation[] = allRelations.filter(
        newvalue =>
          newvalue.parentIssueId === value.childIssueId && newvalue.parentRemoteProjectId === value.childRemoteProjectId && newvalue !== value
      );
      if (newRelations.length > 0) this.buildHierarchy(newRelations, allRelations);
    });
  }

  getAutomaticRelations() {
    this.treeLoading = true;
    this.backlogLoading = true;
    let projectid: string = this.data.staticProject;
    let viewpointId: number = this.data.staticActiveViewpoint;

    let flattenedTree: IssueNode[] = this.flattenTree();

    this.settingsSubscription = combineLatest([
      this.hierarchySettings$,
      this.aggregator.getIssueLinks(flattenedTree, this.backlog, this.data.staticRemoteProjects),
    ]).subscribe({
      next: levellabel => {

        if (levellabel[0] === null || levellabel[0].length === 0) {
          this.snackbar.openSnackBar('There are no hierarchy labels maintained for this viewpoint.');
          this.treeLoading = false;
          this.backlogLoading = false;
          return;
        } else {
          let settings = <IssueRelationSettings>{
            projectId: projectid,
            viewpointId: viewpointId,
            labelSettings: levellabel[0],
            links: levellabel[1],
          };


          this.data.getAutomaticRelations(settings, flattenedTree, this.backlog).subscribe({
            next: res => {
              this.applyAutomaticTreeAndBacklog(res[1], res[0]);
            },
            error: error => {
              console.error(error);
              this.treeLoading = false;
              this.backlogLoading = false;
            },
          });
        }
      },
      error: error => {
        console.error(error);
        this.treeLoading = false;
        this.backlogLoading = false;
      },
    });
  }

  applyAutomaticTreeAndBacklog(newBacklog: IssueNode[], newTree: IssueNode[]) {
    this.nodeLookup.clear();
    this.prepareDragAndDrop([...newBacklog, ...newTree])

    this.treeData.length = 0;
    this.backlog.length = 0;
    this.filteredBacklog.length = 0;
    this.treeData.push(...newTree);
    this.filteredBacklog.push(...newBacklog);
    this.backlog.push(...newBacklog);

    this.itemMoved = this.compareTreeToSavestate(this.treeData);
    this.treeLoading = false;
    this.backlogLoading = false;
    this.evaluateTree(this.treeData)
  }

  saveRelations() {
    this.treeLoading = true;
    this.relationsSave.length = 0;
    let viewpoint: number = this.data.staticActiveViewpoint;
    let projectId: string = this.data.staticProject;
    this.backend
      .deleteSelectedRemoteIssueRelations(projectId, viewpoint)
      .pipe(
        switchMap(res => {
          this.buildRelationObjects(this.treeData, viewpoint, projectId, 0, true);
          return this.backend.addSelectedRemoteIssueRelations(projectId, viewpoint, this.relationsSave);
        })
      )
      .subscribe(() => {
        this.snackbar.openSnackBar('Hierarchy saved to server!', 'green-snackbar');
        this.treeLoading = false;
        this.itemMoved = false;
        this.treeDataSaveState = this.createJSONTree(this.treeData);
        this.relationsSave.length = 0; //Reset after saving
      });
  }

  buildRelationObjects(nodes: IssueNode[], viewpoint: number, projectId: string, outerorder: number, level_zero: boolean): void {
    nodes.forEach(node => {
      let innerorder: number = 0;
      node.children.forEach(child => {
        let relation = <IssueRelation>{
          projectId: projectId,
          viewpointId: viewpoint,
          parentIssueId: node.issue.issueId,
          parentRemoteProjectId: node.issue.projectId,
          childIssueId: child.issue.issueId,
          childRemoteProjectId: child.issue.projectId,
          nodeOrder: innerorder,
        };
        this.relationsSave.push(relation);
        innerorder++;
        this.buildRelationObjects([child], viewpoint, projectId, outerorder, false);
      });

      if (level_zero) {
        let relation = <IssueRelation>{
          projectId: projectId,
          viewpointId: viewpoint,
          parentIssueId: node.issue.issueId,
          parentRemoteProjectId: node.issue.projectId,
          childIssueId: node.issue.issueId,
          childRemoteProjectId: node.issue.projectId,
          nodeOrder: outerorder,
        };
        outerorder++;
        this.relationsSave.push(relation);
      }
    });
  }

  getALMIssues(issues: Issue[]): Observable<ALMIssue[]> {
    let remoteProjects: RemoteProject[] = this.data.staticRemoteProjects;
    let projectsCopy: RemoteProject[] = JSON.parse(JSON.stringify(remoteProjects)); //Copy to avoid mutable manipulation
    const o_issues = issues.map(issue => {
      let project = projectsCopy.find(value => value.remoteProjectId === issue.remoteProjectId);

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

  evaluateTree(tree: IssueNode[]) {
    this.treeLoading = true;
    this.backend.evaluateTree(this.data.staticProject, this.data.staticActiveViewpoint, tree).subscribe({
      next: evaluatedTree => {
        this.applyNewKPIsAndErrors(evaluatedTree);
        this.treeLoading = false;
        this.snackbar.openSnackBar('Tree evalutation successful!');
      },
      error: err => {
        this.treeLoading = false;
        this.snackbar.openSnackBar('Error evaluating the hierarchy. Try again later', 'red-snackbar');
      },
    });
  }

  applyNewKPIsAndErrors(tree: IssueNode[]) {
    tree.forEach(node => {
      let currNode: IssueNode | undefined = this.nodeLookup.get(node.id);
      if (currNode !== undefined) {
        currNode.kpiErrors = node.kpiErrors;
        currNode.issue.timeStats.accumulatedEstimateHours = node.issue.timeStats.accumulatedEstimateHours;
        currNode.issue.timeStats.accumulatedSpentHours = node.issue.timeStats.accumulatedSpentHours;
      }
      if (node.children.length !== 0) this.applyNewKPIsAndErrors(node.children);
    });
  }

  errorsContainErrorType(errors: IssueErrorObject[], type: ErrorType): boolean {
    return errors.find(element => element.type === type) !== undefined;
  }

  drop(event: any) {
    const draggedItemId: string = event.item.data;
    const draggedItem = this.nodeLookup.get(draggedItemId);


    if (!this.dropActionTodo || !draggedItem) {
      this.clearDragInfo(true);
      return;
    }

    //don't drag items with children back to the backlog
    if (event.container.id === 'backlog' && draggedItem.children.length !== 0) {
      this.snackbar.openSnackBar('Items containing nested items cannot be moved back to the backlog!');
      this.clearDragInfo(true);
      return;
    }

    this.itemMoved = true;

    const parentItemId = event.previousContainer.id;

    let targetListId;

    if (this.dropActionTodo.targetId === 'backlog' || this.dropActionTodo.targetId === 'main') {
      targetListId = this.dropActionTodo.targetId;
    } else {
      targetListId = this.getParentNodeId(this.dropActionTodo.targetId, this.filteredBacklog, 'backlog');
      if (!targetListId) targetListId = this.getParentNodeId(this.dropActionTodo.targetId, this.treeData, 'main');
    }

    // console.log(
    //   '\nmoving\n',
    //   '[' + draggedItemId + '] from list [' + parentItemId + ']',
    //   '\n[' + this.dropActionTodo.action + ']\n[' + this.dropActionTodo.targetId + '] from list [' + targetListId + ']'
    // );

    const oldItemContainer =
      parentItemId !== 'main' ? (parentItemId !== 'backlog' ? this.nodeLookup.get(parentItemId)!.children : this.filteredBacklog) : this.treeData;
    const newContainer =
      targetListId !== 'main' ? (targetListId !== 'backlog' ? this.nodeLookup.get(targetListId)!.children : this.filteredBacklog) : this.treeData;

    let i = oldItemContainer.findIndex((c: IssueNode) => c.id === draggedItemId);
    oldItemContainer.splice(i, 1);

    if (parentItemId === 'backlog') {
      //handle backlog filtering
      let i = this.backlog.findIndex((c: IssueNode) => c.id === draggedItemId);
      this.backlog.splice(i, 1);
    }

    switch (this.dropActionTodo.action) {
      case 'before':
      case 'after':
        const targetIndex = newContainer.findIndex((c: IssueNode) => c.id === this.dropActionTodo.targetId);
        if (this.dropActionTodo.action == 'before') {
          newContainer.splice(targetIndex, 0, draggedItem!);
        } else {
          newContainer.splice(targetIndex + 1, 0, draggedItem!);
        }
        if (targetListId === 'backlog') {
          //handle backlog filering
          this.backlog.push(draggedItem!);
        }
        break;

      case 'inside':
        this.nodeLookup.get(this.dropActionTodo.targetId)!.children.push(draggedItem!);
        this.nodeLookup.get(this.dropActionTodo.targetId)!.isExpanded = true;
        break;

      case 'top':
        newContainer.push(draggedItem);
    }

    this.clearDragInfo(true);
    this.itemMoved = this.compareTreeToSavestate(this.treeData);
  }

  dragMoved(event: any) {
    let e = this.document.elementFromPoint(event.pointerPosition.x, event.pointerPosition.y);
    if (!e) {
      this.clearDragInfo();
      return;
    }
    let container = e.classList.contains('node-item') || e.classList.contains('adding-box') ? e : e.closest('.node-item');
    if (!container) {
      this.clearDragInfo();
      return;
    }

    this.dropActionTodo = {
      targetId: container.getAttribute('data-id')!,
    };

    const targetRect = container.getBoundingClientRect();
    const oneThird = targetRect.height / 3;
    const half = targetRect.height / 2;

    if (this.dropActionTodo.targetId === 'backlog' || this.dropActionTodo.targetId === 'main') {
      this.dropActionTodo['action'] = 'top';
    } else {
      //target is in the backlog
      if (this.backlog.findIndex(value => this.dropActionTodo.targetId === value.id) !== -1) {
        if (event.pointerPosition.y - targetRect.top < half) {
          // before
          this.dropActionTodo['action'] = 'before';
        } else {
          // after
          this.dropActionTodo['action'] = 'after';
        }
      } else {
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
      }
    }

    this.showDragInfo();
  }

  getParentNodeId(id: string, nodesToSearch: IssueNode[], parentId: string): string {
    for (let node of nodesToSearch) {
      if (node.id === id) return parentId;
      let ret = this.getParentNodeId(id, node.children, node.id);
      if (ret) return ret;
    }
    return '';
  }

  showDragInfo() {
    this.clearDragInfo();
    if (this.dropActionTodo && this.dropActionTodo.targetId !== 'backlog' && this.dropActionTodo.targetId !== 'main') {
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

  convertALMIssueToNode(ALMIssue: ALMIssue, issue: Issue, order: number = -1): IssueNode {
    return <IssueNode>{
      issue: ALMIssue,
      children: [],
      id: `${ALMIssue.projectId}${ALMIssue.issueId}`,
      isExpanded: false,
      nodeOrder: order,
      kpiErrors: issue.kpiErrors,
    };
  }

  convertNodeToIssueJSONCheckObject(node: IssueNode): IssueJSONCheckObject {
    return <IssueJSONCheckObject>{
      id: node.id,
      children: [],
    };
  }

  compareTreeToSavestate(nodes: IssueNode[]): boolean {
    let tree: string = this.createJSONTree(nodes);
    return tree !== this.treeDataSaveState;
  }

  convertTopNodes(nodes: IssueNode[]): IssueJSONCheckObject[] {
    let res: IssueJSONCheckObject[] = [];
    nodes.forEach(value => {
      res.push(this.convertNodeToIssueJSONCheckObject(value));
    });
    return res;
  }

  convertChildren(nodes: IssueNode[], res: IssueJSONCheckObject[]): IssueJSONCheckObject[] {
    nodes.forEach(node => {
      if (node.children.length !== 0) {
        node.children.forEach(child => {
          this.placeNodeinTree(node.id, res, this.convertNodeToIssueJSONCheckObject(child));
          this.convertChildren([child], res);
        });
      }
    });
    return res;
  }

  placeNodeinTree(parentID: string, nodes: IssueJSONCheckObject[], node: IssueJSONCheckObject) {
    nodes.forEach(value => {
      if (value.id === parentID) value.children.push(node);
      else this.placeNodeinTree(parentID, value.children, node);
    });
  }

  createJSONTree(nodes: IssueNode[]): string {
    let arr: IssueJSONCheckObject[] = [];
    arr.push(...this.convertTopNodes(nodes));
    this.convertChildren(nodes, arr);
    let tree: string = JSON.stringify(arr);
    return tree;
  }

  openIssueDetailDialog(node: IssueNode, tree: boolean) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.minWidth = '1000px';

    dialogConfig.data = {
      node: node,
    };

    if (tree) this.dialog.open(NodeTreeDetailDialogComponent, dialogConfig);
    else this.dialog.open(NodeBacklogDetailDialogComponent, dialogConfig);
  }

  flattenTree(): IssueNode[] {
    let tree: IssueNode[] = JSON.parse(JSON.stringify(this.treeData));
    let nodes: IssueNode[] = [];

    tree.forEach(node => {
      nodes.push(node);
      this.handleChildren(nodes, node);
    });
    return nodes;
  }

  handleChildren(nodes: IssueNode[], node: IssueNode) {
    if (node.children.length !== 0) {
      nodes.push(...node.children);
      node.children.forEach(child => {
        this.handleChildren(nodes, child);
      });
    }
  }
}
