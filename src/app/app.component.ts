import { Component, inject, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { getAuth, User, onAuthStateChanged } from '@firebase/auth';
import { AuthService } from './services/auth.service';
import { DataService } from './services/data.service';
import { FirestoreService } from './services/firestore.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'software-project-planner';
  isLoggedIn: boolean = false;

  @ViewChild('drawer') drawer: MatSidenav | undefined;

  auth = inject(AuthService);
  data = inject(DataService);
  router = inject(Router);
  firestore = inject(FirestoreService);

  constructor() {
    this.authStatusListener();
  }

  authStatusListener() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.isLoggedIn = true;
        this.data.setUser(user);
        this.firestore.projectCollector(user.uid);
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  logout() {
    this.auth.logout();
  }

  navigate(value: string) {
    if (this.drawer != undefined) this.drawer.close();

    this.router.navigate(['/create-project/' + value]);
  }
}
