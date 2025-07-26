import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'

@Component({
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConfirmDeleteComponent {
  element: string | undefined
  constructor(public modal: NgbActiveModal) {}
}
