import {Component, OnDestroy, OnInit} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import {User} from "../../models/user";
import {UserService} from "../../services/user.service";
import {AddUsersComponent} from "./add-users/add-users.component";
import {UserProfile} from "../../models/enums/user-profile";
import {DatePipe} from "@angular/common";


@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  standalone: false,
  styleUrls: ['./users-management.component.css']
})
export class UsersManagementComponent implements OnInit, OnDestroy {

  users: User[] = [];
  isLoading = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }


  loadUsers(): void {
    this.isLoading = true;

    const loadSub = this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.isLoading = false;
      }
    });

    this.subscription.add(loadSub);
  }

  add(): void {
    const modalRef = this.modalService.open(AddUsersComponent, {
      backdrop: 'static',
      keyboard: false,
      size: 'lg'
    });

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadUsers(); // Recharger la liste après ajout
        }
      },
      (dismissed) => {
        // Modal fermée sans sauvegarde
      }
    );
  }

  edit(user: User): void {
    const modalRef = this.modalService.open(AddUsersComponent, {
      backdrop: 'static',
      keyboard: false,
      size: 'lg'
    });

    // Passer l'utilisateur à modifier au composant modal
    modalRef.componentInstance.user = { ...user };

    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadUsers(); // Recharger la liste après modification
        }
      },
      (dismissed) => {
        // Modal fermée sans sauvegarde
      }
    );
  }

  confirmDelete(userId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.delete(userId);
    }
  }

  private delete(userId: number): void {
    const deleteSub = this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.loadUsers(); // Recharger la liste après suppression
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
      }
    });

    this.subscription.add(deleteSub);
  }

  getProfileLabel(profile: UserProfile | string): string {
    console.log(profile);
    const profileMap: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'USER': 'Utilisateur',
      'COMPANY': 'Entreprise',
      'DRIVER': 'Chauffeur'
    };

    return profileMap[profile as string] || profile as string;
  }

  getProfileBadgeClass(profile: UserProfile): string {
    const classMap: { [key: string]: string } = {
      'ADMIN': 'badge bg-danger',
      'USER': 'badge bg-primary',
      'COMPANY': 'badge bg-success',
      'DRIVER': 'badge bg-warning text-dark'
    };

    return classMap[profile] || 'badge bg-secondary';
  }

  // Méthode utilitaire pour formater la date
  formatDate(date: string | Date): string {
    if (!date) return '';

    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Méthode pour obtenir le nom complet
  getFullName(user: User): string {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }

  // Méthode pour filtrer les utilisateurs (si nécessaire plus tard)
  filterUsers(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.loadUsers();
      return;
    }

    const filtered = this.users.filter(user =>
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    );

    this.users = filtered;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
