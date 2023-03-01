
import { inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import {Router} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SnackbarComponent } from '../snackbar/snackbar.component';




@Injectable({ providedIn: 'root' })
export class ErrorInterceptor implements HttpInterceptor {

    router = inject(Router)
    auth = inject(AuthService)
    snackbar = inject(SnackbarComponent)

    constructor() {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(x=> this.handleError(x)));
    }

    private handleError(err: HttpErrorResponse): Observable<any> {
        if (err.status === 401) {
                this.auth.logout();
                this.snackbar.openSnackBar("Unauthorized Server Request! You are logged out.");
            return of(EMPTY);
        }

        if (err.status === 0 || err.status === 500) {
            this.router.navigate(['/500'])
            return of(EMPTY);
        }

        if (err.status === 404) {
            this.router.navigate(['/404'], {queryParams: {e:"server"}})
        }

        return throwError(() => err);
    }
}
