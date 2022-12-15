import { Component, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Project } from 'src/app/models/project';
import { DataService } from 'src/app/services/data.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-project-search',
  templateUrl: './project-search.component.html',
  styleUrls: ['./project-search.component.scss'],
})
export class ProjectSearchComponent implements OnInit{

  data = inject(DataService);


  

  @Output() navigationEvent = new EventEmitter<string>();

  projects: Project[] = []

  ngOnInit(): void {
    this.data.projects.subscribe((value) => {
      this.projects = value;
    })
  }

  navigate(value: string): void {
    this.navigationEvent.next(value);
  }

 
}
