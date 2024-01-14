import { Directive, HostBinding } from '@angular/core';

const PANEL_BODY_CLASS_NAME = 'panel-body';

@Directive({
  selector: 'app-panel-body',
})
export class PanelBodyDirective {
  @HostBinding('class') className = PANEL_BODY_CLASS_NAME;
}
