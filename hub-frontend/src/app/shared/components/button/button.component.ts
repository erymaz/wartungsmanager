import { Component, Input, OnInit } from '@angular/core';
import { GeneralConfigurationService } from 'src/app/dashboard/shared/services/general-configuration.service';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {
  @Input() mode: 'primary' | 'transparent' | 'outline' = 'primary';
  colorOptions = {
    'background-color': '',
    color: '',
    'border-color': '',
  };
  constructor(private generalConfigurationService: GeneralConfigurationService) {}

  ngOnInit(): void {
    if (this.mode === 'primary') {
      this.generalConfigurationService.getGeneralConfiguration().subscribe(item => {
        if (!item) return;
        const primaryColor = item.find(v => v.key === 'primaryColor');
        if (primaryColor) {
          this.colorOptions['background-color'] = (primaryColor.value as string) || '';
        }
        this.colorOptions['color'] = '#fff';
      });
    }
  }

  onMouseIn() {
    const bgColor = this.colorOptions['background-color'];
    this.colorOptions['background-color'] = this.colorOptions['color'];
    this.colorOptions['color'] = bgColor;
    this.colorOptions['border-color'] = bgColor;
  }

  onMouseOut() {
    const bgColor = this.colorOptions['background-color'];
    this.colorOptions['background-color'] = this.colorOptions['color'];
    this.colorOptions['color'] = bgColor;
    this.colorOptions['border-color'] = '#fff';
  }
}
