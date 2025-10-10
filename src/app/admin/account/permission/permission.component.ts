import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import {Role} from "../../../models/role";
import {Permission} from "../../../models/permission";
import {RoleService} from "../../../services/role.service";
import {PermissionService} from "../../../services/permission.service";
import {MenuItem} from "../../../utils/menu-item";
import {AddPermissionToAccessComponent} from "./add-permission-role/add-permission-to-access.component";


@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.css',
  standalone: false
})
export class PermissionComponent implements OnInit, OnDestroy {
  breadcrumbItems = [
    { label: 'Comptes' },
    { label: 'Permissions', active: true },
  ];

  roles: Role[] = [];
  permissions: Permission[] = [];
  loading: boolean = false;
  menus: MenuItem[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.getAllPermissions();
    this.getRoles();
    this.filterMenusWithActions();
  }

  getRoles(): void {
    this.loading = true;
    this.roleService
      .getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.roles = data;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          console.error('Error loading roles', error);
        },
      });
  }

  getAllPermissions(): void {
    this.loading = true;
    this.permissionService
      .getAllPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.permissions = data;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          console.error('Error loading permissions', error);
        },
      });
  }

  filterMenusWithActions(): void {
    // Import des menus depuis votre sidebar
    const menuItems = [
      {
        id: 1,
        icon: 'bi bi-speedometer2',
        text: 'Dashboard',
        actions: [{ label: 'Dashboard', permission: 'DASHBOARD' }]
      },
      {
        id: 2,
        icon: 'bi bi-signpost-split',
        text: 'Trajets',
        actions: [{ label: 'Trajets', permission: 'TRIPS' }]
      },
      {
        id: 3,
        icon: 'bi bi-buildings',
        text: 'Compagnies',
        actions: [{ label: 'Compagnies', permission: 'COMPANIES' }]
      },
      {
        id: 4,
        icon: 'bi bi-truck-front',
        text: 'Bus',
        actions: [{ label: 'Bus', permission: 'BUS' }]
      },
      {
        id: 5,
        icon: 'bi bi-box-seam',
        text: 'Colis',
        actions: [{ label: 'Colis', permission: 'COLIS' }]
      },
      {
        id: 6,
        icon: 'bi bi-ticket-perforated',
        text: 'Tickets',
        actions: [{ label: 'Tickets', permission: 'TICKETS' }]
      },
      {
        id: 7,
        icon: 'bi bi-truck-front',
        text: 'Chauffeurs',
        actions: [{ label: 'Chauffeurs', permission: 'DRIVERS' }]
      },
      {
        id: 8,
        icon: 'bi bi-calendar',
        text: 'Planning',
        actions: [{ label: 'Planning', permission: 'PLANNING' }]
      },
      {
        id: 11,
        icon: 'bi bi-people',
        text: 'Comptes',
        actions: [
          { label: 'Menu Comptes', permission: 'MENU_COMPTES', isMenu: true, isNotCreatable: true, isNotEditable: true, isNotDeletable: true },
          { label: 'Rôles', permission: 'ROLES' },
          { label: 'Permissions', permission: 'PERMISSIONS' },
          { label: 'Utilisateurs', permission: 'USERS' }
        ]
      },
      {
        id: 9,
        icon: 'bi bi-gear',
        text: 'Configurations',
        actions: [
          { label: 'Menu Configurations', permission: 'MENU_CONFIGURATIONS', isMenu: true, isNotCreatable: true, isNotEditable: true, isNotDeletable: true },
          { label: 'Ma Compagnie', permission: 'MY_COMPANY' },
          { label: 'Utilisateurs', permission: 'USERS' }
        ]
      }
    ];

    this.menus = menuItems.filter(menu => menu.actions && menu.actions.length > 0);
  }

  add(menu: MenuItem): void {
    const modalRef = this.modalService.open(AddPermissionToAccessComponent, {
      backdrop: 'static',
      centered: true,
      size: 'lg',
    });

    modalRef.componentInstance.menu = menu;
    modalRef.componentInstance.roles = this.roles;
    modalRef.componentInstance.permissions = this.permissions;

    modalRef.result.then(
      (result) => {
        if (result) {
          this.getAllPermissions();
        }
      },
      (error) => {}
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
