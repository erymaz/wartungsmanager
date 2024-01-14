import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-alias-modal',
  templateUrl: './add-alias-modal.component.html',
  styleUrls: ['./add-alias-modal.component.scss'],
})
export class AddAliasModalComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder, private modal: NgbActiveModal) {}

  ngOnInit(): void {
    this.form = this.buildForm();
  }

  onSubmit(): void {
    this.modal.close({
      ...this.form.value,
      createdAt: new Date().toISOString(),
    });
  }

  onCancel(): void {
    this.modal.close(null);
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      alias: [null, Validators.required],
      description: [null],
    });
  }
}
