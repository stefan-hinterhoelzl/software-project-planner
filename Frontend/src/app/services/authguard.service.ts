import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { getAuth, onAuthStateChanged, User } from '@firebase/auth';
import { SnackbarComponent } from '../snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService implements CanActivate {

  constructor(private router: Router, private snackbar: SnackbarComponent) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
  boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return new Promise((resolve, reject) => {
      const auth = getAuth();

      onAuthStateChanged(auth, (user: User | null) => {
        if (user) {
          resolve(true);
        } else {
          this.router.navigate(["/login"]);
          this.snackbar.openSnackBar("You are not logged in!", "red-snackbar")
          resolve(false);
        }
      });
    });
  }
}
