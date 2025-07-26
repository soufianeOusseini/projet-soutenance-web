import { Component, OnInit } from '@angular/core';
import { AddTrajetFormComponent } from "./add-form/add-trajet-form.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TrajetService } from "../../services/trajet.service";
import { Trajet } from "../../models/trajet.model";
import {showHttpError, showSuccess} from "../../utils/message.util";
import {ConfirmDeleteComponent} from "../../utils/confirm-delete/confirm-delete.component";

@Component({
  selector: 'app-trajet',
  standalone: false,
  templateUrl: './trajet.component.html',
  styleUrl: './trajet.component.css'
})
export class TrajetComponent implements OnInit {
  trajets: Trajet[] = [];
  loading: boolean = false;

  constructor(
    private modalService: NgbModal,
    private trajetService: TrajetService
  ) {}

  ngOnInit(): void {
    this.loadTrajets();
  }

  loadTrajets(): void {
    this.loading = true;
    this.trajetService.getAll().subscribe({
      next: (data) => {
        this.trajets = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trajets', error);
        this.loading = false;
      }
    });
  }

  add() {
    const modalRef = this.modalService.open(AddTrajetFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'addContactLabel'
    });

    modalRef.result.then(
      (result) => {
        console.log(`Fermé avec: ${result}`);
        if (result === 'saved' || result === 'updated') {
          this.loadTrajets(); 
        }
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }

  edit(trajet: Trajet) {
    const modalRef = this.modalService.open(AddTrajetFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'addContactLabel'
    });

    modalRef.componentInstance.trajet = { ...trajet };
    modalRef.componentInstance.isEditMode = true;

    modalRef.result.then(
      (result) => {
        console.log(`Fermé avec: ${result}`);
        if (result === 'saved' || result === 'updated') {
          this.loadTrajets();
        }
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }

  delete(value: any): void {
    this.trajetService
      .delete(value)
      .subscribe({
        next: (data) => {
          showSuccess()
          this.loadTrajets()
        },
        error: (error) => {
          showHttpError(error)
          console.error(error)
        },
      })
  }

  confirmDelete(id: any) {
    const modalRef = this.modalService.open(ConfirmDeleteComponent, {
      centered: true,
    })
    modalRef.result.then(
      (result) => {
        this.delete(id)
      },
      (error) => {
        console.error(error)
      },
    )
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
