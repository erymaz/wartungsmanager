import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { ApiService } from './services/api.service';

@Injectable({
  providedIn: 'root',
})
export class RightGuard implements CanActivate {
  constructor(private readonly apiService: ApiService) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!route.data || !route.data.right) return true;

    return this.apiService.userRights.then(rights => {
      if (!rights || !rights.global) return false;

      return rights.global[route.data.right];
    });
  }
}
