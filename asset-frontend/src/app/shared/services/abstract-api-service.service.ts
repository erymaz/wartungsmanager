import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import httpErrors from 'http-errors';
import urlJoin from 'url-join';
import { ToastrService } from 'ngx-toastr';

export class AbstractApiService {
  constructor(
    private readonly serviceBaseUrl: string, 
    protected readonly http: HttpClient,
    protected readonly toastrService: ToastrService,
  ) {}

  async get<T = unknown>(
    url: string,
    httpOptions: Record<string, unknown> = {},
  ): Promise<HttpResponse<T>> {
    return this.http
      .get<T>(urlJoin(this.serviceBaseUrl, url), {
        ...httpOptions,
        observe: 'response',
      })
      .toPromise()
      .then(response => {
        if (response.status !== 200) {
          throw httpErrors(response.status, response.statusText);
        }

        return response;
      })
      .catch((...args) => this.parseError<T>(...args));
  }

  async post<T = unknown>(
    url: string,
    body: unknown | null = null,
    httpOptions: Record<string, unknown> = {},
  ): Promise<HttpResponse<T>> {
    return this.http
      .post<T>(urlJoin(this.serviceBaseUrl, url), body, {
        ...httpOptions,
        observe: 'response',
      })
      .toPromise()
      .then(response => {
        if (![200, 201].includes(response.status)) {
          throw httpErrors(response.status, response.statusText);
        }

        return response;
      })
      .catch((...args) => this.parseError<T>(...args));
  }

  async put<T = unknown>(
    url: string,
    body: unknown | null = null,
    httpOptions: Record<string, unknown> = {},
  ): Promise<HttpResponse<T>> {
    return this.http
      .put<T>(urlJoin(this.serviceBaseUrl, url), body, {
        ...httpOptions,
        observe: 'response',
      })
      .toPromise()
      .then(response => {
        if (![200, 201].includes(response.status)) {
          throw httpErrors(response.status, response.statusText);
        }

        return response;
      })
      .catch((...args) => this.parseError<T>(...args));
  }

  async patch<T = unknown>(
    url: string,
    body: unknown | null = null,
    httpOptions: Record<string, unknown> = {},
  ): Promise<HttpResponse<T>> {
    return this.http
      .patch<T>(urlJoin(this.serviceBaseUrl, url), body, {
        ...httpOptions,
        observe: 'response',
      })
      .toPromise()
      .then(response => {
        if (![200, 201].includes(response.status)) {
          throw httpErrors(response.status, response.statusText);
        }

        return response;
      })
      .catch((...args) => this.parseError<T>(...args));
  }

  async delete<T = unknown>(
    url: string,
    httpOptions: Record<string, unknown> = {},
  ): Promise<HttpResponse<T>> {
    return this.http
      .delete<T>(urlJoin(this.serviceBaseUrl, url), {
        ...httpOptions,
        observe: 'response',
      })
      .toPromise()
      .then(response => {
        if (![200, 201].includes(response.status)) {
          throw httpErrors(response.status, response.statusText);
        }

        return response;
      })
      .catch((...args) => this.parseError<T>(...args));
  }

  private parseError<T>(error: HttpErrorResponse): HttpResponse<T> {
    let cur = error;
    while (!!cur.error && typeof cur.error === 'object') {
      if (cur.error.statusCode === 403) {
        this.toastrService.error("Sie haben nicht die entsprechenden Rechte für diese Aktion.", 'Http Error', {
          timeOut: 5000,
          extendedTimeOut: 5000,
        });
      }
      
      cur = cur.error;
    }
    throw cur;
  }
}
