import { Component, inject, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-project-list-view',
  templateUrl: './project-list-view.component.html',
  styleUrls: ['./project-list-view.component.scss']
})
export class ProjectListViewComponent implements OnInit {


  ngOnInit(): void {
    this.data.setActiveProjectView('list');
  }

  data = inject(DataService)
}
