import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { AssetPropertyType, UnitedPropertyDto } from 'shared/common/models';

@Component({
  selector: 'app-property-modal',
  templateUrl: './property-modal.component.html',
  styleUrls: ['./property-modal.component.scss'],
})
export class PropertyModalComponent implements OnInit {
  form!: FormGroup;
  property!: UnitedPropertyDto;
  mode: 'new' | 'edit' = 'new';
  selectedDate = '';
  typeOptions = Object.values(AssetPropertyType);

  get type(): AbstractControl {
    return this.form.get('type') as AbstractControl;
  }

  get value(): AbstractControl {
    return this.form.get('value') as AbstractControl;
  }

  @Output() submitData = new EventEmitter();
  constructor(
    private fb: FormBuilder,
    private modal: NgbActiveModal,
    private formatter: NgbDateParserFormatter,
  ) {}

  ngOnInit(): void {
    this.form = this.buildForm();

    if (this.property) {
      this.form.patchValue({ ...this.property, display: !this.property.isHidden });
      this.onChangeIsHidden();
      if (this.property.type === AssetPropertyType.DATE && this.property.value) {
        const parsedDate = this.formatter.parse(this.property.value as string);

        if (parsedDate) {
          this.selectedDate = this.formatter.format(parsedDate);
        }
      }
    }
  }

  onSelectType(type: AssetPropertyType): void {
    if (type !== this.type.value) {
      this.selectedDate = '';
      this.type.setValue(type);
      this.value.setValue(type === AssetPropertyType.BOOLEAN ? false : null);
    }
  }

  onSelectDate(date: NgbDate): void {
    this.selectedDate = this.formatter.format(date);
    this.value.setValue(new Date(this.selectedDate).toISOString());
  }

  onSubmit(): void {
    this.submitData.emit({ ...this.form.value });
  }

  onCancel(): void {
    this.modal.close(null);
  }

  onChangeIsHidden() {
    this.form.controls['display'].valueChanges.subscribe(v => {
      this.form.controls['isHidden'].setValue(!v);
    });
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      name: [null, Validators.required],
      key: [null, Validators.required],
      type: [null, Validators.required],
      value: [null],
      isHidden: [false],
      display: [true],
      isRequired: [false],
      position: [0],
    });
  }
}
