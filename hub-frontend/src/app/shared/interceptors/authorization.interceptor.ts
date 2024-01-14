import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
@Injectable()
export class AuthorizationInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    request = request.clone({
      withCredentials: environment.production,
    });
    return next.handle(request).pipe(
      catchError((err, event) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          window.location.href = environment.userServiceUrl + 'v1/auth/login';
        }
        throw err;
      }),
      map((event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse && event.status === 401) {
          location.href = environment.userServiceUrl + 'v1/auth/login';
        }
        return event;
      }),
    );
  }
}
