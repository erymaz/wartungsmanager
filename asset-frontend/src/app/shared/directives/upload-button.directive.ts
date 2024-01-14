import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { FileResponse } from 'shared/common/types/files';

import { FileApiService } from '../services/file-api.service';

@Directive({
  selector: '[uploadButton]',
})
export class UploadButtonDirective implements OnInit, OnDestroy {
  private loading = false;
  private input!: HTMLInputElement;
  private inputChangeListener!: Function;
  @Output() uploaded = new EventEmitter<FileResponse>();

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private fileApiService: FileApiService,
  ) {}

  ngOnInit(): void {
    this.input = this.renderer.createElement('input');
    this.renderer.setAttribute(this.input, 'type', 'file');
    this.renderer.addClass(this.input, 'd-none');
    this.renderer.appendChild(this.el.nativeElement, this.input);

    this.inputChangeListener = this.renderer.listen(this.input, 'change', () => {
      this.onUploadFile();
    });
  }

  @HostListener('click')
  onClick(): void {
    if (!this.loading) {
      this.input.click();
    }
  }

  async onUploadFile(): Promise<void> {
    const files = this.input.files;

    if (files?.length) {
      this.setLoading(true);

      try {
        const res = await this.fileApiService.uploadFile(files.item(0) as File);

        if (res) {
          this.uploaded.emit(res);
        }
      } catch (ex) {
        this.uploaded.emit({
          id: 'dd188ea8-2847-4ff8-9142-e9364bcd95f4',
          url: 'dd188ea8-2847-4ff8-9142-e9364bcd95f4',
        } as FileResponse);
      } finally {
        this.input.value = '';
        this.setLoading(false);
      }
    }
  }

  private setLoading(loading: boolean): void {
    this.loading = loading;

    loading
      ? this.renderer.addClass(this.el.nativeElement, 'loading')
      : this.renderer.removeClass(this.el.nativeElement, 'loading');
  }

  ngOnDestroy(): void {
    this.inputChangeListener();
    this.renderer.removeChild(this.el.nativeElement, this.input);
  }
}
