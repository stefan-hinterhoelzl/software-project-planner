import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { from, lastValueFrom, Observable } from 'rxjs';
import { getAuth } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //Attach the Token, when the call is to the backend
    if (request.url.startsWith("http://localhost:3000"))
      return from(this.handle(request, next))
    else return next.handle(request)
  }

  async handle(request: HttpRequest<any>, next: HttpHandler) {
    const auth = getAuth();
    let token: string | undefined = await auth.currentUser?.getIdToken(true);
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await lastValueFrom(next.handle(request));
  }
}
