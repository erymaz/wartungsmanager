import { Component, OnInit } from '@angular/core';
import { Logger, LogService } from 'ng-debug-levels';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'angular-starter';
  private readonly logger: Logger;

  constructor(private readonly logService: LogService, private translate: TranslateService) {
    this.translate.setDefaultLang('en_EN');
    this.logger = this.logService.createLogger('appComponent');
  }

  ngOnInit(): void {
    this.logger.info('test');
  }
}
