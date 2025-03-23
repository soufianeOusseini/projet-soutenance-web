import {Component} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AddFormComponent} from "./add-form/add-form.component";

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.css'
})
export class CompaniesComponent {

  constructor(private modalService: NgbModal) {
  }

  add() {
    console.log("entre")
    const modalRef = this.modalService.open(AddFormComponent, {
      backdrop: 'static',
      centered: true,
      size: 'xl',
    })
    modalRef.result.then(
      (result) => {
        console.log(`Fermé avec: ${result}`);
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }
}
