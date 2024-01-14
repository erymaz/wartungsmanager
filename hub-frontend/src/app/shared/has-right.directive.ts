import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

import { ApiService } from './services/api.service';

@Directive({
  selector: '[hasRight]',
})
export class HasRightDirective {
  hasView = false;

  constructor(
    private readonly apiService: ApiService,
    // tslint:disable-next-line: no-any
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
  ) {}

  @Input() set hasRight(right: string) {
    if (!right) {
      this.setElement(true);
      return;
    }
    this.apiService.userRights.then(rights => {
      if (!rights || !rights.global) {
        this.setElement(false);
        return;
      }
      this.setElement(rights.global[right]);
    });
  }

  private setElement(isShown: boolean) {
    if (isShown && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isShown && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
