import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FileService } from 'src/app/dashboard/shared/services/file.service';

export interface InputConfig {
  type?: string;
  defaultValue?: string | number;
  mode?: 'color' | 'text';
  autoClear?: boolean;
  validateAs?: string;
}

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit, OnChanges {
  @Input() configs: InputConfig = {
    type: 'text',
    defaultValue: '',
    mode: 'text',
    autoClear: false,
    validateAs: 'text',
  };

  @Output() changeInput = new EventEmitter<string | number>();
  @Output() blurInput = new EventEmitter<string | number>();

  input = new FormControl('');
  color = '';

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    if (this.configs.mode === 'color' && typeof this.configs.defaultValue === 'string') {
      this.color = this.configs.defaultValue || '#000000';
    }
    if (this.configs.defaultValue) {
      this.input.setValue(this.configs.defaultValue);
    }
    if (this.configs.validateAs === 'url') {
      this.input.setValidators(
        Validators.pattern(
          /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/,
        ),
      );
    }
    this.onChange();
  }

  ngOnChanges() {
    if (this.configs.defaultValue) {
      this.input.setValue(this.configs.defaultValue);
    }
  }

  onChange() {
    this.input.valueChanges.subscribe((value: string) => {
      if (this.configs.mode === 'color') {
        if (value.indexOf('#') === -1) {
          this.input.setValue('#' + this.input.value);
        }
        if (value.length > 9) {
          this.input.setValue(this.input.value.slice(0, -1));
        }
      }
      this.changeInput.emit(value);
    });
  }

  clearInput() {
    this.input.setValue('');
  }

  async handleFileInput(files: File[] | FileList) {
    const file = await this.fileService.uploadFile(files[0]);
    if (file) {
      this.input.setValue(file.id);
    }
  }
}
