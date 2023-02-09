import { Component, inject, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-project-tree-view',
  templateUrl: './project-tree-view.component.html',
  styleUrls: ['./project-tree-view.component.scss']
})
export class ProjectTreeViewComponent implements OnInit {



  ngOnInit(): void {
    this.data.setActiveProjectView('tree');
  }

  data = inject(DataService)


}
