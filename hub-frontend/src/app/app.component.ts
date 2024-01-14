import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Logger, LogService } from './shared/logger/logger.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'hub-frontend';
  private readonly logger: Logger;

  constructor(
    private readonly logService: LogService,
    private translate: TranslateService,
  ) {
    this.logger = this.logService.createLogger('appComponent');
    this.translate.setDefaultLang('de');
  }

  ngOnInit(): void {
    this.logger.info('test');
  }
}
