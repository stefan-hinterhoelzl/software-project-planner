import { Component, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-search',
  templateUrl: './project-search.component.html',
  styleUrls: ['./project-search.component.scss'],
})
export class ProjectSearchComponent {

  @Output() navigationEvent = new EventEmitter<string>();

  projects = [
    'Projekt1444444444444444444444444444444444444444',
    'Projekt2',
    'Projekt3',
  ];

  navigate(value: string): void {
    this.navigationEvent.next(value);
  }
}
