import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Tab {
  label: string;
  link: string;
  showHistory: boolean;
  createBtn: {
    label: string;
    link: string;
  };
}

@Component({
  selector: 'app-asset-tabs-outlet',
  templateUrl: './asset-tabs-outlet.component.html',
  styleUrls: ['./asset-tabs-outlet.component.scss'],
})
export class AssetTabsOutletComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();

  selectedTabIndex = 0;
  search = new FormControl([null]);

  tabs: Tab[] = [
    {
      label: 'VIEWS.ASSET_TABS.ALLOCATED_ASSETS',
      link: '/allocated-assets',
      showHistory: true,
      createBtn: { label: 'Create new asset', link: '/assets/new' },
    },
    {
      label: 'VIEWS.ASSET_TABS.ASSET_POOL',
      link: '/asset-pool',
      showHistory: true,
      createBtn: { label: 'VIEWS.ASSET_TABS.CREATE_NEW_ASSET', link: '/assets/new' },
    },
    {
      label: 'VIEWS.ASSET_TABS.ASSET_TYPES',
      link: '/asset-types',
      showHistory: false,
      createBtn: { label: 'VIEWS.ASSET_TABS.CREATE_NEW_ASSET_TYPE', link: '/asset-types/new' },
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const [url, search] = this.router.url.split('?q=');

    this.selectedTabIndex = this.getSelectedTabIndex(url);
    this.search.setValue(search || null);

    this.search.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(term => {
        this.router.navigate([this.router.url.split('?')[0]], { queryParams: { q: term } });
      });
  }

  onNavigate(index: number): void {
    this.selectedTabIndex = index;
    this.search.setValue(null, { emitEvent: false });
    this.router.navigate([this.tabs[index].link]);
  }

  private getSelectedTabIndex(currentUrl: string): number {
    const index = this.tabs.findIndex(tab => tab.link === currentUrl);
    return index > -1 ? index : 0;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
