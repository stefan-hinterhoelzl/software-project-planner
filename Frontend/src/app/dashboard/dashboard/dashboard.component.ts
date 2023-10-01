import { Component, inject, OnInit } from '@angular/core';
import { Project } from 'src/app/models/project';
import { DataService } from 'src/app/services/data.service';
import { getAuth } from 'firebase/auth';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  data = inject(DataService);
  dialog = inject(MatDialog);

  favourites: Project[] = [];

  ngOnInit(): void {
    this.data.projects$.subscribe(value => {
      this.favourites = value.filter(project => project.favourite === true);
    });
  }

  async getToken() {
    const auth = getAuth();
    let token: string = await auth.currentUser?.getIdToken(true)!;
  }
}
