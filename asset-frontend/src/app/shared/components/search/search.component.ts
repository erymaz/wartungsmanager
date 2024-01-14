import { AfterViewInit, Component, forwardRef, Input, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

const SEARCH_CONTROL_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SearchComponent),
  multi: true,
};

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [SEARCH_CONTROL_ACCESSOR],
})
export class SearchComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private onTouch!: () => void;
  private onModalChange!: (value: string) => void;
  private destroyed$ = new Subject<void>();

  @Input() placeholder = '';
  input = new FormControl([null]);

  ngAfterViewInit(): void {
    this.input.valueChanges
      ?.pipe(takeUntil(this.destroyed$), debounceTime(250), distinctUntilChanged())
      .subscribe(value => {
        this.onTouch();
        this.onModalChange(value);
      });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onModalChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  writeValue(value: string | null): void {
    this.input.setValue(value, { emitEvent: false });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
