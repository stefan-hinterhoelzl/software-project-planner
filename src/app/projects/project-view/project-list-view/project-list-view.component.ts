import { HttpResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { catchError, forkJoin, map, Observable, of, take } from 'rxjs';
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
  project?: Project;
  issues?: any[] = [];
  remoteProjects?: any[] = [];
  selectedIssues?: string[] = [];
  selectedProjects?: number[] = [];
  selectedLabels?: string[] = [];
  loading: boolean;
  filterGroup = new FormGroup({
    labelsControl: new FormControl(''),
    projectsControl: new FormControl(''),
    searchControl: new FormControl('')
  })
  labels: string[] = []

  constructor() {
    this.loading = true;
  }

  ngOnInit(): void {
    this.data.setActiveProjectView('list');

    this.data.activeviewproject.pipe(take(1)).subscribe((project) => {
      this.project = project;

      this.getProjects(project.ALMInstances).pipe(take(1)).subscribe(projects => {
        this.remoteProjects?.push(...projects);
      });

      this.getLabelsForProjects(project.ALMInstances).pipe(take(1)).subscribe(labels => {
        labels.forEach(label => {
          if (this.labels.indexOf(label.name) === -1) this.labels.push(label.name)
        })
      })

      this.initializeData()

     });
  }

  initializeData() {
    this.loading = true;
    this.issues = [];
    this.selectedIssues = this.project?.selectedIssues;

    let filterstring: string = this.createIssueFilterString();

    
    let projects: RemoteProject[] = [...this.project?.ALMInstances!]

    if (this.selectedProjects?.length !== 0) {
      projects = projects.filter((project, index, array) => {
        return (this.selectedProjects?.includes(project.remoteID))
      })
    }

    this.getIssuesForProjects(projects, filterstring).pipe(take(1)).subscribe(issues => {
      this.issues?.push(...issues);
      
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

  getIssuesForProjects(projects: RemoteProject[], filterstring: string) {
    const issues: Observable<HttpResponse<any[]>>[] = projects.map(project =>
      this.alm.getIssuesPerProject(project.remoteID, project.accessToken, filterstring));

      return forkJoin(issues).pipe(map(issues => issues.flat().map(issue => issue.body).flat()))

  }

  getProjects(projects: RemoteProject[]) {
    const o_projects: Observable<HttpResponse<any[]>>[] = projects.map(project =>
      this.alm.getProjectPerID(project.remoteID, project.accessToken));

      return forkJoin(o_projects).pipe(map(project => project.map(project => project.body)))
  }

  getLabelsForProjects(projects: RemoteProject[]) {
    const labels: Observable<HttpResponse<any[]>>[] = projects.map(project =>
      this.alm.getLabelsPerProject(project.remoteID, project.accessToken));

      return forkJoin(labels).pipe(map(labels => labels.flat().map(label => label.body).flat()))
  }


  saveSelection() {
    //How to Handle hierarchy? Probably with flat map
    this.issues?.forEach((value, index, array) => {
      let id: string = this.getIssueUniqueId(value)
      if (!this.selectedIssues?.includes(id)) {
        this.selectedIssues?.push(id)
      }
    });

    this.project!.selectedIssues = this.selectedIssues!

    this.firestore.updateProject(this.project!).then(() => {
      this.snackbar.openSnackBar("Item selection saved!", "green-snackbar")
    }).catch(() => {
      this.snackbar.openSnackBar("Error saving selection, pleaser try again!", "red-snackbar")
    })
  }

  markAllItems(bool: boolean) {
    this.issues?.forEach((value, index, array) => {
      value.selected = bool;
    })
  }

  private createIssueFilterString() {
    let filterstring: string = ""
    let searchterm = this.filterGroup.get("searchControl")?.value!
    if (searchterm !== "") filterstring = filterstring.concat("?search=", searchterm)
    if (this.selectedLabels?.length !== 0) {
      if (filterstring.indexOf("?") === -1) filterstring = filterstring.concat("?labels=")
      else filterstring = filterstring.concat("&labels=")
      this.selectedLabels?.forEach(value => {
        filterstring = filterstring.concat(value,",")
      });
      filterstring = filterstring.substring(0, filterstring.length - 1);
    }

    return filterstring;

  }

  private getIssueUniqueId(issue: any) {
    let s: string = issue.project_id.toString()  +  issue.id.toString()
    return s
  }


}
