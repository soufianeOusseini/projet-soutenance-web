import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {filter, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {
  DASHBOARD_ACTIONS,
  TRIPS_ACTIONS,
  COMPANIES_ACTIONS,
  BUS_ACTIONS,
  COLIS_ACTIONS,
  TICKETS_ACTIONS,
  DRIVERS_ACTIONS,
  PLANNING_ACTIONS,
  COMPTES_ACTIONS,
  CONFIGURATIONS_ACTIONS
} from "./menu-actions";
import {MenuItem} from "../../../utils/menu-item";
import {Role} from "../../../models/role.model";
import {AuthService} from "../../../auth/service/auth.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  standalone: false
})
export class SidebarComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[] = [];
  openMenuIds: Set<number> = new Set();
  openChildMenuIds: Set<number> = new Set();
  currentUrl: string = '';
  accordionMode: boolean = true;
  userRoles: Role[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    console.log('🚀 SidebarComponent - Initialisation');

    this.authService.getUserRoles().pipe(
      takeUntil(this.destroy$)
    ).subscribe((roles: Role[]) => {
      this.userRoles = roles;
      this.initializeMenu();

      setTimeout(() => {
        this.updateActiveMenuItem();
      }, 100);
    });

    this.currentUrl = this.router.url;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
      this.updateActiveMenuItem();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeMenu(): void {
    const allMenuItems = [
      {
        id: 1,
        icon: 'bi bi-speedometer2',
        text: 'Dashboard',
        link: '/admin/dashboard',
        permission: 'DASHBOARD_READ',
        actions: DASHBOARD_ACTIONS,
        roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN']
      },
      {
        id: 2,
        icon: 'bi bi-signpost-split',
        text: 'Trajets',
        link: '/admin/trips',
        permission: 'TRIPS_READ',
        actions: TRIPS_ACTIONS,
        roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN']
      },
      {
        id: 3,
        icon: 'bi bi-buildings',
        text: 'Compagnies',
        link: '/admin-system/companies',
        permission: 'COMPANIES_READ',
        actions: COMPANIES_ACTIONS,
        roles: ['ROLE_SUPER_ADMIN']
      },
      {
        id: 12,
        icon: 'bi bi-building-gear',
        text: 'Agences',
        link: '/admin/agencies',
        permission: 'AGENCIES_READ',
        roles: ['ROLE_COMPANY_ADMIN']
      },
      {
        id: 4,
        icon: 'bi bi-truck-front',
        text: 'Bus',
        link: '/admin/bus',
        permission: 'BUS_READ',
        actions: BUS_ACTIONS,
        roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN']
      },
      {
        id: 5,
        icon: 'bi bi-box-seam',
        text: 'Colis',
        link: '/admin/colis',
        permission: 'COLIS_READ',
        actions: COLIS_ACTIONS,
        roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN']
      },
      {
        id: 6,
        icon: 'bi bi-ticket-perforated',
        text: 'Tickets',
        link: '/admin/tickets',
        permission: 'TICKETS_READ',
        actions: TICKETS_ACTIONS,
        roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN']
      },
      {
        id: 7,
        icon: 'bi bi-truck-front',
        text: 'Chauffeurs',
        link: '/admin/drivers',
        permission: 'DRIVERS_READ',
        actions: DRIVERS_ACTIONS,
        roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN']
      },
      {
        id: 8,
        icon: 'bi bi-calendar',
        text: 'Planning',
        link: '/admin/planning',
        permission: 'PLANNING_READ',
        actions: PLANNING_ACTIONS,
        roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN']
      },
      {
        id: 11,
        icon: 'bi bi-people',
        text: 'Comptes',
        permission: 'COMPTES_READ',
        actions: COMPTES_ACTIONS,
        roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'],
        children: [
          {
            id: 111,
            text: 'Rôles',
            link: '/admin/roles',
            icon: 'bi bi-shield-check',
            permission: 'ROLES_READ',
            roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN']
          },
          {
            id: 112,
            text: 'Permissions',
            link: '/admin/permissions',
            icon: 'bi bi-key',
            permission: 'PERMISSIONS_READ',
            roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN']
          },
          {
            id: 113,
            text: 'Utilisateurs',
            link: '/admin/users',
            icon: 'bi bi-person-gear',
            permission: 'USERS_READ',
            roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN']
          }
        ]
      },
      {
        id: 9,
        icon: 'bi bi-gear',
        text: 'Configurations',
        permission: 'CONFIGURATIONS_READ',
        actions: CONFIGURATIONS_ACTIONS,
        roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN'],
        children: [
          {
            id: 101,
            text: 'Ma Compagnie',
            link: '/admin/my-company',
            icon: 'bi bi-building',
            permission: 'MY_COMPANY_READ',
            roles: ['ROLE_ADMIN', 'ROLE_COMPANY_ADMIN']
          }
        ]
      }
    ];

    this.menuItems = this.filterMenusByRole(allMenuItems);
  }

  private filterMenusByRole(items: MenuItem[]): MenuItem[] {
    return items
      .filter(item => this.hasRequiredRole(item))
      .map(item => ({
        ...item,
        children: item.children ? this.filterMenusByRole(item.children) : undefined
      }))
      .filter(item => !item.children || item.children.length > 0);
  }

  private hasRequiredRole(item: MenuItem): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    const hasRole = this.userRoles.some(role =>
      item.roles?.includes(role?.name!)
    );


    return hasRole;
  }

  updateActiveMenuItem(): void {
    this.resetActiveState(this.menuItems);
    this.setActiveMenuItem(this.menuItems, this.currentUrl);
  }

  private resetActiveState(items: MenuItem[]): void {
    items.forEach(item => {
      item.active = false;
      if (item.children) {
        this.resetActiveState(item.children);
      }
    });
  }

  private setActiveMenuItem(items: MenuItem[], currentUrl: string): boolean {
    for (const item of items) {
      if (item.link && this.isActiveRoute(item.link, currentUrl)) {
        item.active = true;
        if (item.id) {
          this.openMenu(item.id);
        }
        return true;
      }

      if (item.children && this.setActiveMenuItem(item.children, currentUrl)) {
        item.active = true;
        if (item.id) {
          this.openMenu(item.id);
        }
        return true;
      }
    }
    return false;
  }

  private isActiveRoute(menuLink: string, currentUrl: string): boolean {
    if (currentUrl === menuLink) {
      return true;
    }
    if (currentUrl.startsWith(menuLink + '/')) {
      return true;
    }
    return false;
  }

  hasChildren(menuItem: MenuItem): boolean {
    return !!menuItem.children && menuItem.children.length > 0;
  }

  toggleMenu(item: MenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!item.id) {
      return;
    }

    if (this.openMenuIds.has(item.id)) {
      this.closeMenu(item.id);
    } else {
      if (this.accordionMode) {
        this.closeAllMenusExcept(item.id);
      }
      this.openMenu(item.id);
    }
  }

  toggleChildMenu(child: MenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!child.id) {
      return;
    }

    if (this.openChildMenuIds.has(child.id)) {
      this.closeChildMenu(child.id);
    } else {
      if (this.accordionMode) {
        this.closeAllChildMenusExcept(child.id);
      }
      this.openChildMenu(child.id);
    }
  }

  openMenu(menuId: number): void {
    this.openMenuIds.add(menuId);
  }

  closeMenu(menuId: number): void {
    this.openMenuIds.delete(menuId);
  }

  openChildMenu(menuId: number): void {
    this.openChildMenuIds.add(menuId);
  }

  closeChildMenu(menuId: number): void {
    this.openChildMenuIds.delete(menuId);
  }

  closeAllMenus(): void {
    this.openMenuIds.clear();
    this.openChildMenuIds.clear();
  }

  closeAllMenusExcept(exceptId: number): void {
    const menusToClose = Array.from(this.openMenuIds).filter(id => id !== exceptId);
    menusToClose.forEach(id => this.closeMenu(id));
  }

  closeAllChildMenusExcept(exceptId: number): void {
    const menusToClose = Array.from(this.openChildMenuIds).filter(id => id !== exceptId);
    menusToClose.forEach(id => this.closeChildMenu(id));
  }

  toggleAccordionMode(): void {
    this.accordionMode = !this.accordionMode;
  }

  isMenuOpen(item: MenuItem): boolean {
    return !!item.id && this.openMenuIds.has(item.id);
  }

  isChildMenuOpen(item: MenuItem): boolean {
    return !!item.id && this.openChildMenuIds.has(item.id);
  }

  isMenuActive(item: MenuItem): boolean {
    return !!item.active;
  }
}
