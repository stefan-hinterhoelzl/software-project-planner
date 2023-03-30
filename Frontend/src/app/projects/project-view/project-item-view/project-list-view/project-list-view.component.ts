
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest,  map,  Observable, of, share,  Subscription, switchMap, tap } from 'rxjs';
import { IssueDetailDialogComponent } from 'src/app/dialogs/issue-detail-dialog/issue-detail-dialog.component';
import { NewViewpointDialogComponent } from 'src/app/dialogs/new-viewpoint-dialog/new-viewpoint-dialog.component';
import { ALMFilteroptions, ALMIssue, ALMPaginationoptions, ALMProject } from 'src/app/models/alm.models';
import { Issue } from 'src/app/models/issue';
import { Project, RemoteProject, Viewpoint } from 'src/app/models/project';
import { ALMDataAggregator, GitLabAggregator } from 'src/app/services/ALM/alm-data-aggregator.service';
import { BackendService } from 'src/app/services/backend.service';
import { DataService } from 'src/app/services/data.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';

@Component({
  selector: 'app-project-list-view',
  templateUrl: './project-list-view.component.html',
  styleUrls: ['./project-list-view.component.scss'],
})
export class ProjectListViewComponent implements OnInit {
  //Providers
  data = inject(DataService);
  snackbar = inject(SnackbarComponent);
  dialog = inject(MatDialog);
  backend = inject(BackendService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  aggregator: ALMDataAggregator;

  //Form Data
  filterGroup = new FormGroup({
    labelsControl: new FormControl({ value: [], disabled: true }),
    stateControl: new FormControl({ value: '', disabled: true }),
    projectsControl: new FormControl(),
    searchControl: new FormControl({ value: '', disabled: true }),
    startDateControl: new FormControl({ value: '', disabled: true }),
    endDateControl: new FormControl({ value: '', disabled: true }),
  });

  //state booleans
  init: boolean;
  _loading: Observable<boolean>;
  $loading: BehaviorSubject<boolean>;

  // Pagination Options
  pageIndex: number = 0;
  pageSize: number = 20;
  pageSizeOptions = [20, 50, 100];
  length: number = 0;
  nextPage: string = '';
  prevPage: string = '';
  firstPage: string = '';
  lastPage: string = '';
  totalPagesWith100: number = 0;
  showFirstLastButtons: boolean = true;

  labels: string[] = [];

  //First Level Data
  project?: Project;
  viewpoint?: Viewpoint;

  //ALM Projects
  _ALMProjects?: Observable<ALMProject[]>;
  ALMProjects?: ALMProject[];
  selectedProject?: ALMProject;

  //RemoteProjects
  _RemoteProjects?: Observable<RemoteProject[]>;
  selectedRemoteProject?: RemoteProject;

  //Issues
  SelectedIssues?: Issue[];
  _selectedIssues?: Observable<Issue[]>;
  selectedIssuesSub?: Subscription;
  selectedDeltaPlus?: Issue[] = [];
  selectedDeltaMinus?: Issue[] = [];

  _issues?: Observable<ALMIssue[]>;
  issues?: ALMIssue[];
  issueSub?: Subscription;

  //Labels
  _labels?: Observable<string[]>;

  //Data Observables
  project$ = this.data.activeProject$.pipe(tap(project => (this.project = project)));
  viewpoint$ = this.data.activeViewpoint$.pipe(tap(viewpoint => {
    this.viewpoint = viewpoint
    this.data.setActiveRemoteproject(0)
  }));


  almProjects$ = this.data.almProjects$;


  activeRemoteProject$ = this.data.activeRemoteProject$.pipe(
    tap(remoteProject => {
      if (remoteProject !== undefined) {
        this.selectedRemoteProject = remoteProject;
        this.init = false;
        this.initializeData();
      } else {
        //reset everything
        this.init = true;
        this.$loading.next(true)
        this.clearFilters();
        this.filterGroup.get('projectsControl')?.setValue('');
      }

    }),
    share()
  );


  viewpoints$ = this.data.viewpoints$.pipe(share());


  view$ = combineLatest([this.project$, this.almProjects$, this.viewpoints$]).pipe(share());


  labels$ = this.activeRemoteProject$.pipe(
    switchMap(project => this.aggregator.getLabels(project!)),
    share()
  );

  constructor() {
    this.$loading = new BehaviorSubject<boolean>(true);
    this._loading = this.$loading.asObservable();
    this.aggregator = new GitLabAggregator();
    this.init = true;
  }

  ngOnInit(): void {
    this.filterGroup
      .get('projectsControl')
      ?.valueChanges.pipe(
        tap(projectId => {
          if (projectId !== '')
          this.data.setActiveRemoteproject(projectId as number);
        })
      )
      .subscribe();
  }

  initializeData() {
    this.labels = [];
    this.clearFilters();
    this.nextPage = '';
    this.prevPage = '';
    this.firstPage = '';
    this.lastPage = '';
    this.pageIndex = 0;
    this.pageSize = 20;

    this.getSelectedIssues()
      .pipe(switchMap(() => this.getIssues()))
      .subscribe({
        next: () => {
          this.$loading.next(false);
          this.filterGroup.get('labelsControl')?.enable();
          this.filterGroup.get('stateControl')?.enable();
          this.filterGroup.get('searchControl')?.enable();
          this.filterGroup.get('startDateControl')?.enable();
          this.filterGroup.get('endDateControl')?.enable();
        },
      });
  }

  getIssues() {
    this.$loading.next(true);

    let filter: ALMFilteroptions = this.createFilterOptions();
    let pagination: ALMPaginationoptions = this.createPaginationOptions();

    return this.aggregator.getIssues(this.selectedRemoteProject!, filter, pagination).pipe(
      share(),
      tap(value => {
        this.issues = value.issues;
        if (value.totalitems === undefined) {
          this.showFirstLastButtons = false;
          this.length = 10000;
        } else {
         this.length = value.totalitems;
         this.totalPagesWith100 = Math.ceil(this.length/100)
         this.clearFilters();
        }
      }),
      map(value => value.issues),
      map(almIssues => {
        return almIssues.map(almIssue => {
          let i: Issue | undefined = this.SelectedIssues?.find(value => value.remoteIssueId === almIssue.issueId);
          let i2: Issue | undefined = this.selectedDeltaPlus?.find(value => value.remoteIssueId === almIssue.issueId);
          let i3: Issue | undefined = this.selectedDeltaMinus?.find(value => value.remoteIssueId === almIssue.issueId);

          almIssue.selected = true;
          if (i === undefined && i2 === undefined && i3 === undefined) almIssue.selected = false;
          if (i !== undefined && i3 !== undefined && i2 === undefined) almIssue.selected = false;

          return almIssue;
        });
      })
    );
  }

  getSelectedIssues() {
    return this.backend
      .getSelectedRemoteIssuesForViewpoint(this.project?.projectId!, this.viewpoint?.viewpointId!, this.selectedRemoteProject?.remoteProjectId!)
      .pipe(
        share(),
        tap(value => (this.SelectedIssues = value))
      );
  }

  setSelected(bool: boolean, issue: ALMIssue) {
    issue.selected = bool;

    if (bool) {
      let i: Issue | undefined = this.selectedDeltaMinus?.find(value => value.remoteIssueId === issue.issueId);
      if (i === undefined)
        this.selectedDeltaPlus?.push(<Issue>{
          remoteIssueId: issue.issueId,
          remoteProjectId: issue.projectId,
          projectId: this.project?.projectId,
          viewpointId: this.viewpoint?.viewpointId,
        });
      else {
        let n: number = this.selectedDeltaMinus?.findIndex(value => value.remoteIssueId === issue.issueId)!;
        this.selectedDeltaMinus?.splice(n, 1);
      }
    } else {
      let i: Issue | undefined = this.selectedDeltaPlus?.find(value => value.remoteIssueId === issue.issueId);
      if (i === undefined)
        this.selectedDeltaMinus?.push(<Issue>{
          remoteIssueId: issue.issueId,
          remoteProjectId: issue.projectId,
          projectId: this.project?.projectId,
          viewpointId: this.viewpoint?.viewpointId,
        });
      else {
        let n: number = this.selectedDeltaPlus?.findIndex(value => value.remoteIssueId === issue.issueId)!;
        this.selectedDeltaPlus?.splice(n, 1);
      }
    }
  }

  saveSelection() {
    this.$loading.next(true);
    let plus: Observable<any>;
    let minus: Observable<any>;
    let minussave: Issue[] | undefined = [];
    let plussave: Issue[] | undefined = [];

    if (this.selectedDeltaPlus !== undefined && this.selectedDeltaPlus.length !== 0) {
      plus = this.backend.addRemoteIssuesToViewpoint(this.selectedDeltaPlus);
      plussave = this.selectedDeltaMinus;
    } else plus = of({});

    if (this.selectedDeltaMinus !== undefined && this.selectedDeltaMinus.length !== 0) {
      minus = this.backend.removeRemoteIssuesToViewpoint(this.selectedDeltaMinus);
      minussave = this.selectedDeltaMinus;
    } else minus = of({});

    this.selectedDeltaMinus = [];
    this.selectedDeltaPlus = [];

    plus
      .pipe(
        switchMap(() => minus),
        switchMap(() => this.getSelectedIssues()),
        switchMap(() => this.getIssues())
      )
      .subscribe({
        next: () => {
          this.$loading.next(false);
          this.snackbar.openSnackBar('Saved!', 'green-snackbar');
        },
        error: () => {
          if (minussave !== undefined) this.selectedDeltaMinus = minussave;
          if (plussave !== undefined) this.selectedDeltaPlus = plussave;
          this.snackbar.openSnackBar('An error occured, try again.', 'red-snackbar');
          this.$loading.next(false);
        },
      });
  }

  markAllItems(bool: boolean) {
    this.issues?.forEach((value, index, array) => {
      if (value.selected !== bool) this.setSelected(bool, value);
    });
  }

  handlePageEvent(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;

    this.reloadIssues();
  }

  reloadIssues() {
    this.getIssues().subscribe(() => this.$loading.next(false));
  }

  setLength(items: number) {
    this.length = items;
  }

  openIssueDetailDialog(issue: ALMIssue) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.minWidth = '1000px';

    dialogConfig.data = {
      issue: issue,
    };

    const dialogRef = this.dialog.open(IssueDetailDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        issue.selected = true;
      }
    });
  }

  selectAllAndSave() {
    // let filterstring: string = this.createFilterOptions();
    // let currentPage: number = 2;
    // let requests: string[] = [];
    // while (currentPage < this.totalPagesGitlab) {
    //   currentPage++;
    // }


    let filter = this.createFilterOptions()
    let pagination = <ALMPaginationoptions> {
      perPage: 100
    }

    let index: number = 0;
    let issues: ALMIssue[] = [];
    while (index <= this.totalPagesWith100) {
      pagination.page = index
      this.aggregator.getIssues(this.selectedRemoteProject!, filter, pagination).subscribe({
        next: value => {
          issues.push(...value.issues)
        },
        error: error => {
          console.error(error)
          this.snackbar.openSnackBar("Error saving Items, try again!", "red-snackbar")
          this.reloadIssues();
        }
      })


    }

  }

  clearFilters() {
    this.filterGroup.get('labelsControl')?.setValue([]);
    this.filterGroup.get('stateControl')?.setValue('');
    this.filterGroup.get('searchControl')?.setValue('');
    this.filterGroup.get('startDateControl')?.setValue('');
    this.filterGroup.get('endDateControl')?.setValue('');
  }

  private createFilterOptions(): ALMFilteroptions {
    return <ALMFilteroptions>{
      titleDescription: this.filterGroup.get('searchControl')?.value!,
      labels: this.filterGroup.get('labelsControl')?.value!,
      state: this.filterGroup.get('stateControl')?.value!,
      updatedAfter: this.filterGroup.get('startDateControl')?.value!,
      updatedBefore: this.filterGroup.get('startDateControl')?.value!,
    };
  }

  private createPaginationOptions(): ALMPaginationoptions {
    return <ALMPaginationoptions>{
      page: this.pageIndex,
      perPage: this.pageSize,
    };
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
    if (viewpoint.viewpointId !== undefined) this.data.setActiveViewpoint(viewpoint.viewpointId);
  }
}
