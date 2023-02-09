import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  snackBar = inject(SnackbarComponent);
  router = inject(Router);

  constructor() {}

  socialLogin() {
    const auth = getAuth();

    let provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        this.snackBar.openSnackBar('Logged in!', 'green-snackbar');
        this.router.navigate(["/dashboard"])
      })
      .catch((error) => {
        const errorCode = error.code;
        this.snackBar.openSnackBar(
          'Login failed, try again later!',
          'red-snackbar'
        );
      });
  }


  logout() {
    const auth = getAuth();
    signOut(auth).then(() => {
        this.snackBar.openSnackBar('Logged out!', 'green-snackbar');
        this.router.navigate(["/login"])
    })
    .catch((error) => {
      const errorCode = error.code;
      this.snackBar.openSnackBar(
        'Logout failed, try again later!',
        'red-snackbar'
      );
    });
  }


}
