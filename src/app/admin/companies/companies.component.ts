import {Component} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AddFormComponent} from "./add-form/add-form.component";
import { ButtonModule } from 'primeng/button';
@Component({
    selector: 'app-companies',
    templateUrl: './companies.component.html',
    styleUrl: './companies.component.css',
    standalone: false
})
export class CompaniesComponent {
  constructor(private modalService: NgbModal) {
  }

  add() {
    console.log("entre");
    const modalRef = this.modalService.open(AddFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'addContactLabel'
    });

    modalRef.result.then(
      (result) => {
        console.log(`Fermé avec: ${result}`);
        // Handle form submission here
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }
}
