import { Component, inject } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { ALMService } from 'src/app/services/alm.service';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss']
})
export class ProjectDashboardComponent {

  ngOnInit(): void {

  }

  data = inject(DataService)
  gitlab = inject(ALMService)



}
