import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as httpErrors from 'http-errors';
import jwt_decode from 'jwt-decode';
import { CookieService } from 'ngx-cookie';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
export interface DataResponse<T> {
  data: T;
}
export interface AuthInfo {
  id: string;
  tenantId: string;
  iat: number;
  name: string;
  exp?: number;
  scopes?: string[];
  userLang: string;
  isMultitenant: boolean;
}
export interface UserRights {
  [resourceKey: string]: {
    [rightKey: string]: boolean;
  };
}
export const VIEW_KEY = 'global-view';
export const WRITE_KEY = 'global-write';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  userRights: Promise<UserRights>;
  constructor(private http: HttpClient, private readonly cookieService: CookieService, private toastrService: ToastrService) {
    this.userRights = this.get<DataResponse<UserRights>>(
      environment.userServiceUrl + 'v1/me/rights',
    ).then(_ => _.body?.data || {});
  }

  async hasEditRight() {
    return await this.userRights.then(rights => rights?.global[WRITE_KEY]);
  }
  getDfAppSessionCookie(): string {
    return this.cookieService.get(environment.dfAppsSessionCookieName);
  }
  getDfAppSessionCookieContent(): AuthInfo | undefined {
    return jwt_decode(this.getDfAppSessionCookie());
  }
  async getUserImageUrl(userId: string): Promise<string> {
    try {
      const freedata: HttpResponse<DataResponse<
        Array<{ key: string; value: string }>
      >> = await this.get<DataResponse<Array<{ key: string; value: string }>>>(
        `${environment.userServiceUrl}v1/users/${userId}/freeData`,
      );
      if (freedata && freedata.body && freedata.body.data) {
        const image = freedata.body.data.find(data => data.key === 'imageId');
        if (image && image.value) {
          return `${environment.fileServiceUrl}/image/${image.value}?w=35&h=35`;
        }
      }
    } catch (e) {
      // silent
    }
    return ``;
  }
  get<T>(url: string, httpOptions: object = {}): Promise<HttpResponse<T> & { body: T }> {
    return this.withErrorHandling(
      this.http.get<T>(url, {
        ...httpOptions,
        observe: 'response',
      }),
      [200],
    );
  }

  post<T>(
    url: string,
    body: unknown | null = null,
    httpOptions: object = {},
  ): Promise<HttpResponse<T> & { body: T }> {
    return this.withErrorHandling(
      this.http.post<T>(url, body, {
        ...httpOptions,
        observe: 'response',
      }),
      [200, 201],
    );
  }

  put<T>(
    url: string,
    body: unknown | null = null,
    httpOptions: object = {},
  ): Promise<HttpResponse<T> & { body: T }> {
    return this.withErrorHandling(
      this.http.put<T>(url, body, {
        ...httpOptions,
        observe: 'response',
      }),
      [200],
    );
  }

  delete<T>(url: string, httpOptions: object = {}): Promise<HttpResponse<T> & { body: T }> {
    return this.withErrorHandling(
      this.http.delete<T>(url, {
        ...httpOptions,
        observe: 'response',
      }),
      [200],
    );
  }

  private withErrorHandling<T>(request: Observable<HttpResponse<T>>, allowedStatuses: number[]) {
    return request.toPromise().then(
      (response: HttpResponse<T>) => {
        if (response) {
          if (!allowedStatuses.includes(response.status)) {
            throw httpErrors(response.status, response.statusText);
          }
        }

        return response as HttpResponse<T> & { body: T };
      },
      async (error: HttpErrorResponse) => {
        if (error.error.statusCode === 403) {
          this.toastrService.error("Sie haben nicht die entsprechenden Rechte für diese Aktion.", 'Http Error', {
            timeOut: 5000,
            extendedTimeOut: 5000,
          });
        }

        throw httpErrors(error.status, error.statusText);
      },
    );
  }
}
