import { DialogRef } from '@angular/cdk/dialog';
import { HttpResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { forkJoin, map, Observable, of, take } from 'rxjs';
import { IssueDetailDialogComponent } from 'src/app/dialogs/issue-detail-dialog/issue-detail-dialog.component';
import { Project, RemoteProject } from 'src/app/models/project';
import { ALMService } from 'src/app/services/alm.service';
import { DataService } from 'src/app/services/data.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SnackbarComponent } from 'src/app/snackbar/snackbar.component';

@Component({
  selector: 'app-project-list-view',
  templateUrl: './project-list-view.component.html',
  styleUrls: ['./project-list-view.component.scss'],
})
export class ProjectListViewComponent implements OnInit {
  data = inject(DataService);
  alm = inject(ALMService);
  firestore = inject(FirestoreService);
  snackbar = inject(SnackbarComponent)
  dialog = inject(MatDialog);
  project?: Project;
  remoteProject?: RemoteProject;
  issues?: any[] = [];
  remoteProjects?: any[] = [];
  selectedIssues?: string[] = [];
  loading: boolean;
  init: boolean;
  pageIndex: number = 0;
  pageSize: number = 20;
  pageSizeOptions = [20, 50, 100];
  length: number = 0;
  nextPage: string = "";
  prevPage: string = "";
  firstPage: string = "";
  lastPage: string = "";
  totalPagesGitlab: number = 0;
  showFirstLastButtons: boolean = true;
  filterGroup = new FormGroup({
    labelsControl: new FormControl({value: [], disabled: true}),
    stateControl: new FormControl({value: '', disabled: true}),
    projectsControl: new FormControl(''),
    searchControl: new FormControl({value: '', disabled: true}),
    startDateControl: new FormControl({value: '', disabled: true}),
    endDateControl: new FormControl({value: '', disabled: true})
  })
  labels: string[] = []

  constructor() {
    this.loading = true;
    this.init = true;
  }

  ngOnInit(): void {



    this.data.activeviewproject.pipe(take(1)).subscribe((project) => {
      this.project = project;

    //   this.getProjects(project.ALMInstances).pipe(take(1)).subscribe(projects => {
    //     this.remoteProjects?.push(...projects);
    //   });

    //   this.filterGroup.get("projectsControl")?.valueChanges.subscribe((project_id) => {
    //     let p: RemoteProject = this.project?.ALMInstances.find((value, index, array) => value.remoteID.toString() === project_id?.toString())!
    //     this.remoteProject = p

    //     this.initializeData()
    //   })

      });
      this.initializeData()
  }

  initializeData() {
    this.init = false;
    this.labels = [];
    this.filterGroup.get("labelsControl")?.setValue([]);
    this.filterGroup.get("stateControl")?.setValue("");
    this.filterGroup.get("searchControl")?.setValue("");
    this.nextPage = "";
    this.prevPage = "";
    this.firstPage = "";
    this.lastPage = "";
    this.pageIndex = 0;
    this.pageSize = 20;
    let project: RemoteProject = this.remoteProject!;


    this.aggregateLabelsForProject(project)

    this.getIssues();

  }

  getIssues() {
    this.loading = true;
    this.issues = [];
    let project: RemoteProject = this.remoteProject!;
    console.log(this.project)
    console.log(this.selectedIssues)
    //this.selectedIssues?.push(...this.project?.selectedIssues!);

    let filterstring: string = this.createIssueFilterString();

    let paginationString: string = this.createIssuePaginationString(filterstring)

    let optionstring = filterstring.concat(paginationString)

    console.log(optionstring)


    this.getIssuesForProject(project, optionstring).pipe(take(1)).subscribe(issues => {
      let totalItems: string = issues.headers.get("x-total")!;
      this.totalPagesGitlab  = Number(issues.headers.get("x-total-pages"))
      if (totalItems === null) {
        this.showFirstLastButtons = false
        this.length = 10000
      }
      else this.length = Number(totalItems);

      this.issues?.push(...issues.body!);
      console.log(this.issues)

      this.issues?.forEach((value, index, array) => {
        let id: string = this.getIssueUniqueId(value)
        value.uniqueID = id;
        value.selected = false;
        if (this.selectedIssues?.includes(id)) {
          value.selected = true;
        }
      })
      console.log(this.issues)
      this.loading = false;
    });

  }

  getIssuesForProject(project: RemoteProject, filterstring: string) {
    const issues: Observable<HttpResponse<any[]>> = this.alm.getIssuesPerProject(project.remoteProjectId, project.accessToken, filterstring);

      return issues

  }

  getProjects(projects: RemoteProject[]) {
    const o_projects: Observable<HttpResponse<any[]>>[] = projects.map(project =>
      this.alm.getProjectPerID(project.remoteProjectId, project.accessToken));

      return forkJoin(o_projects).pipe(map(project => project.map(project => project.body)))
  }


  aggregateLabelsForProject(project: RemoteProject) {
    let requests: string[] = []
    let totalPages: number = 0;
    let currentPage: number = 2;

    this.getLabelsForProject(project, "?per_page=100").pipe(take(1)).subscribe(res => {
      totalPages = Number(res.headers.get('x-total-pages'))
      this.labels.push(...res.body!.map(label => label.name));
      console.log(totalPages)

      while (currentPage<=totalPages) {
        requests.push("?per_page=100&page="+currentPage)
        currentPage++
        console.log(requests)
      }

      if (requests.length !== 0) {
        const o_labels = requests.map((value, index, array) => {
          return this.getLabelsForProject(project, value)
        })

       forkJoin(o_labels).pipe(map(labels => labels.flat().map(label => label.body).flat())).subscribe(labels => {
        console.log(labels.map(label=> label.name))
        this.labels.push(...labels!.map(label => label.name))
        this.filterGroup.get("labelsControl")?.enable();
        this.filterGroup.get("searchControl")?.enable();
        this.filterGroup.get("stateControl")?.enable();
        this.filterGroup.get("startDateControl")?.enable();
        this.filterGroup.get("endDateControl")?.enable();
        })
      } else {
        this.filterGroup.get("labelsControl")?.enable();
        this.filterGroup.get("searchControl")?.enable();
        this.filterGroup.get("stateControl")?.enable();
        this.filterGroup.get("startDateControl")?.enable();
        this.filterGroup.get("endDateControl")?.enable();
      }
    })

  }

  getLabelsForProject(project: RemoteProject, paginationString: string) {
    const labels: Observable<HttpResponse<any[]>> = this.alm.getLabelsPerProject(project.remoteProjectId, project.accessToken, paginationString);

      return labels
      //return labels.pipe(map(labels => labels.body))
  }


  saveSelection() {
    //How to Handle hierarchy? Probably with flat map
    this.issues?.forEach((value, index, array) => {
      let id: string = this.getIssueUniqueId(value)
      if (!this.selectedIssues?.includes(id)) {
        this.selectedIssues?.push(id)
      }
    });

    //this.project!.selectedIssues = this.selectedIssues!

    this.firestore.updateProject(this.project!).then(() => {
      this.snackbar.openSnackBar("Item selection saved!", "green-snackbar")
    }).catch(() => {
      this.snackbar.openSnackBar("Error saving selection, pleaser try again!", "red-snackbar")
    })
  }

  markAllItems(bool: boolean) {
    this.issues?.forEach((value, index, array) => {
      this.setSelected(bool, value)
    })
  }

  setSelected(bool: boolean, issue: any) {
    let id: string = this.getIssueUniqueId(issue)

    if (bool) {
      this.selectedIssues?.push(id)
      issue.selected = bool;
    } else {
      let index: number = this.selectedIssues?.indexOf(id)!;
      if (index != -1) {
        this.selectedIssues?.splice(index, 1)
        issue.selected = bool;
      }
    }
  }

  handlePageEvent(e: PageEvent) {
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    console.log(e);

    this.getIssues();

  }

  setLength(items: number) {
    this.length = items;
  }

  openIssueDetailDialog(issue: any) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.minWidth = '1000px';


    dialogConfig.data = {
      issue: issue,
    };

    const dialogRef = this.dialog.open(IssueDetailDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.setSelected(true, issue)
      }
    })
  }

  selectAllAndSave() {
    let filterstring: string = this.createIssueFilterString();
    let currentPage: number = 2;
    let requests: string[] = [];

    while (currentPage<this.totalPagesGitlab) {





      currentPage++
    }





  }

  clearFilters() {
    this.filterGroup.get("labelsControl")?.setValue([]);
    this.filterGroup.get("stateControl")?.setValue("");
    this.filterGroup.get("searchControl")?.setValue("");
    this.filterGroup.get("startDateControl")?.setValue("");
    this.filterGroup.get("endDateControl")?.setValue("");
  }

  private createIssueFilterString() {
    let filterstring: string = ""
    let searchterm = this.filterGroup.get("searchControl")?.value!
    let selectedLabels = this.filterGroup.get("labelsControl")?.value!
    let selectedState = this.filterGroup.get("stateControl")?.value!
    let selectedStartDate: string = this.filterGroup.get("startDateControl")?.value!
    let selectedEndDate: string = this.filterGroup.get("startDateControl")?.value!

    if (searchterm !== "") filterstring = filterstring.concat("?search=", searchterm)
    if (selectedLabels?.length !== 0) {
      if (filterstring.indexOf("?") === -1) filterstring = filterstring.concat("?labels=")
      else filterstring = filterstring.concat("&labels=")
      selectedLabels?.forEach(value => {
        filterstring = filterstring.concat(value,",")
      });
      filterstring = filterstring.substring(0, filterstring.length - 1);
    }
    if (selectedState !== "") {
      if (filterstring.indexOf("?") === -1) filterstring = filterstring.concat("?state=")
      else filterstring = filterstring.concat("&state=")

      filterstring = filterstring.concat(selectedState);
    }

    if (selectedEndDate !== "" && selectedStartDate !== "") {
      let startDate: string = new Date(selectedStartDate).toISOString()
      let endDate: string = new Date(selectedEndDate).toISOString()

      if (filterstring.indexOf("?") === -1) filterstring = filterstring.concat("?updated_after=")
      else filterstring = filterstring.concat("&updated_after=")

      filterstring = filterstring.concat(startDate)
      filterstring = filterstring.concat("&update_before"+endDate)

    }

    return filterstring;

  }


  private createIssuePaginationString(filterstring: string) {
    let paginationString: string = ""
    if (filterstring.indexOf("?") === -1) paginationString = paginationString.concat("?")
    else paginationString = paginationString.concat("&")
    paginationString = paginationString.concat("page=", (this.pageIndex + 1).toString()) //Angular starts at 0, Gitlab at one

    paginationString = paginationString.concat("&per_page=", this.pageSize.toString())

    return paginationString
  }

  private getIssueUniqueId(issue: any) {
    let s: string = issue.project_id.toString()  +  issue.id.toString()
    return s
  }


}