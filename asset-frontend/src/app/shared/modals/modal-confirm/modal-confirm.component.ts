import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

interface ModalConfirmContent {
  title: string;
  body: string;
  confirm: string;
  abort: string;
}

@Component({
  selector: 'app-modal-confirm',
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.scss'],
})
export class ModalConfirmComponent {
  content!: ModalConfirmContent;

  constructor(private modal: NgbActiveModal) {}

  close(confirmed: boolean): void {
    this.modal.close(confirmed);
  }
}
