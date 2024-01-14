import { Directive, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { AssetApiService } from '../../shared/services/asset-api.service';

@Directive()
export class AssetTabDirective implements OnInit, OnDestroy {
  protected destroyed$ = new Subject<void>();

  searchTerm = '';

  constructor(
    protected route: ActivatedRoute,
    protected modalService: NgbModal,
    protected assetApiService: AssetApiService,
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroyed$), map(params => params.q))
      .subscribe(term => this.searchTerm = term || '');
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
