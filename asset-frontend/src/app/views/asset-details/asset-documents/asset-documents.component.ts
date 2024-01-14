import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AssetDocumentDto } from 'shared/common/models';
import { environment } from 'src/environments/environment';

import { DocumentModalComponent } from './document-modal/document-modal.component';

const ASSET_DOCUMENTS_CONTROL_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AssetDocumentsComponent),
  multi: true,
};

@Component({
  selector: 'app-asset-documents',
  templateUrl: './asset-documents.component.html',
  styleUrls: ['./asset-documents.component.scss'],
  providers: [ASSET_DOCUMENTS_CONTROL_ACCESSOR],
})
export class AssetDocumentsComponent implements ControlValueAccessor {
  private onTouch!: () => void;
  private onModalChange!: (documents: AssetDocumentDto[]) => void;

  disabled = false;
  documents: AssetDocumentDto[] = [];

  constructor(private modalService: NgbModal) {}

  async onAdd() {
    const doc = await this.openDocumentModal();

    console.log(doc);
    if (doc) {
      this.onTouch();
      this.documents = [...this.documents, doc];
      this.onModalChange(this.documents);
    }
  }
  documentIdToUrl(documentId: string) {
    if (!documentId) return;
    return `${environment.fileServiceUrl}v1/file/${documentId}`;
  }

  async onEdit(document: AssetDocumentDto) {
    const doc = await this.openDocumentModal(document);

    if (doc) {
      this.onTouch();
      this.documents = this.documents.map(d => (d.id === doc.id ? doc : d));
      this.onModalChange(this.documents);
    }
  }

  onRemove(id: string) {
    this.onTouch();
    this.documents = this.documents.filter(d => d.id !== id);
    this.onModalChange(this.documents);
  }

  writeValue(documents: AssetDocumentDto[]): void {
    this.documents = documents;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  registerOnChange(fn: (documents: AssetDocumentDto[]) => void): void {
    this.onModalChange = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  private openDocumentModal(document?: AssetDocumentDto): Promise<AssetDocumentDto | null> {
    const modal = this.modalService.open(DocumentModalComponent, {
      centered: true,
      backdrop: 'static',
    });

    if (document) {
      modal.componentInstance.mode = 'edit';
      modal.componentInstance.document = document;
    }
    return modal.result;
  }
}
