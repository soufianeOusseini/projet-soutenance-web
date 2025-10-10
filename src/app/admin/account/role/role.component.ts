import { Component, OnInit } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {Role} from "../../../models/role";
import {RoleService} from "../../../services/role.service";
import {AddRoleFormComponent} from "./add-form/add-role-form.component";
import {showHttpError, showSuccess} from "../../../utils/message.util";
import {ConfirmDeleteComponent} from "../../../utils/confirm-delete/confirm-delete.component";

@Component({
  selector: 'app-role',
  standalone: false,
  templateUrl: './role.component.html',
  styleUrl: './role.component.css'
})
export class RoleComponent implements OnInit {
  roles: Role[]=[];
  loading: boolean = false;

  constructor(
    private modalService: NgbModal,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getAllRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading roles', error);
        this.loading = false;
      }
    });
  }

  add() {
    const modalRef = this.modalService.open(AddRoleFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'addRoleLabel'
    });

    modalRef.result.then(
      (result) => {
        console.log(`Fermé avec: ${result}`);
        if (result === 'saved' || result === 'updated') {
          this.loadRoles();
        }
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }

  edit(role: Role) {
    const modalRef = this.modalService.open(AddRoleFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      keyboard: true,
      ariaLabelledBy: 'addRoleLabel'
    });

    modalRef.componentInstance.role = { ...role };
    modalRef.componentInstance.isEditMode = true;

    modalRef.result.then(
      (result) => {
        console.log(`Fermé avec: ${result}`);
        if (result === 'saved' || result === 'updated') {
          this.loadRoles();
        }
      },
      (reason) => {
        console.log(`Fermé avec raison: ${reason}`);
      }
    );
  }

  delete(value: any): void {
    this.roleService
      .deleteRole(value)
      .subscribe({
        next: (data) => {
          showSuccess()
          this.loadRoles()
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
}
