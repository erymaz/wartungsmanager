import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

enum Pages {
  AllocatedAssets = '/allocated-assets',
  AssetPool = '/asset-pool',
  AssetTypes = '/asset-types'
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private history: string[] = [];

  constructor(private router: Router, private location: Location) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  navigate(page: keyof typeof Pages): Promise<boolean> {
    return this.router.navigate([Pages[page]]);
  }

  back(): void {
    this.history.pop();

    this.history.length > 0 ?
      this.location.back() :
      this.router.navigateByUrl('/');
  }
}
