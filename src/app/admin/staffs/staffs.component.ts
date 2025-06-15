
import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../services/user.service';
import {AddStaffFormComponent} from "./add-staff-form/add-staff-form.component";
import {AddBusFormComponent} from "../bus/add-form/add-bus-form.component";
import {ConfirmationDialogComponent} from "../../utils/confirm-dialog";

@Component({
  selector: 'app-staffs',
  standalone: false,
  templateUrl: './staffs.component.html',
  styleUrl: './staffs.component.css'
})
export class StaffsComponent implements OnInit{

  users: any[] = [];
  filteredUsers: any[] = [];
  page = 1;
  pageSize = 10;
  totalItems = 0;
  searchTerm = '';

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    console.log("staffsComponent");
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;

      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  applyFilter(event: any): void {
    this.searchTerm = event.target.value.trim().toLowerCase();
    if (this.searchTerm) {
      this.filteredUsers = this.users.filter(user =>
        user.firstName?.toLowerCase().includes(this.searchTerm) ||
        user.lastName?.toLowerCase().includes(this.searchTerm) ||
        user.username?.toLowerCase().includes(this.searchTerm) ||
        user.email?.toLowerCase().includes(this.searchTerm)
      );
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  openAddUserModal(): void {
    const modalRef = this.modalService.open(AddStaffFormComponent, { size: 'lg', backdrop: 'static' });
    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadUsers();
        }
      },
      () => {}
    );
  }

  editUser(user: any): void {
    const modalRef = this.modalService.open(AddStaffFormComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.setUser(user);
    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadUsers();
        }
      },
      () => {}
    );
  }

  deleteUser(id: number): void {
    const modalRef = this.modalService.open(ConfirmationDialogComponent);
    modalRef.componentInstance.title = 'Confirmation de suppression';
    modalRef.componentInstance.message = 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?';
    modalRef.result.then(
      (result) => {
        if (result === 'confirm') {
          this.userService.deleteUser(id).subscribe({
            next: () => {
              this.loadUsers();
            },
            error: (error) => {
              console.error('Error deleting user:', error);
            }
          });
        }
      },
      () => {}
    );
  }

  add() {
    console.log("entre");
    const modalRef = this.modalService.open(AddStaffFormComponent, {
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
