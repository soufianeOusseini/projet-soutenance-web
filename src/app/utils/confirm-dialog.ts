import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>
    <div class="modal-body">
      <p>{{ message }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss('Cancel')">Non</button>
      <button type="button" class="btn btn-danger" (click)="activeModal.close('Confirm')">Oui</button>
    </div>
  `,
  standalone: true
})
export class ConfirmationDialogComponent {
  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Êtes-vous sûr de vouloir effectuer cette action?';

  constructor(public activeModal: NgbActiveModal) {}
}
