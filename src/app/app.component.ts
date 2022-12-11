import { Component, inject } from '@angular/core';
import { getAuth, User, onAuthStateChanged } from '@firebase/auth';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'software-project-planner';
  isLoggedIn: boolean = false;

  auth = inject(AuthService)



  constructor() {
    this.authStatusListener();
  }

  authStatusListener() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });
  }


  logout() {
    this.auth.logout();
  }






}
