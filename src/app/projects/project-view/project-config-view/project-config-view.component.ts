import { Component, inject, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-project-config-view',
  templateUrl: './project-config-view.component.html',
  styleUrls: ['./project-config-view.component.scss']
})
export class ProjectConfigViewComponent implements OnInit {


  ngOnInit(): void {
    this.data.setActiveProjectView('config');
  }

  data = inject(DataService)
}


