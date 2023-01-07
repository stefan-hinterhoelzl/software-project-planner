import { Component, inject, OnInit } from '@angular/core';
import { Project } from 'src/app/models/project';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  data = inject(DataService)

  favourites: Project[] = []



ngOnInit(): void {
  this.data.projects.subscribe((value) => {
    this.favourites = value.filter(project => project.favourite === true)
  });
}

}
