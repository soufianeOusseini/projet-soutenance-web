import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {filter} from 'rxjs/operators';
import {MenuItem} from "../../utils/menu-item";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  standalone: false
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];
  openMenuIds: Set<number> = new Set();
  openChildMenuIds: Set<number> = new Set();
  currentUrl: string = '';
  accordionMode: boolean = true;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.initializeMenu();
    this.currentUrl = this.router.url;
    this.updateActiveMenuItem();

    // Écouter les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
      this.updateActiveMenuItem();
    });
  }

  initializeMenu(): void {
    this.menuItems = [
      {
        id: 1,
        icon: 'bi bi-speedometer2',
        text: 'Dashboard',
        link: '/admin/dashboard'
      },
      {
        id: 2,
        icon: 'bi bi-signpost-split',
        text: 'Trajets',
        link: '/admin/trips',
      },
      {
        id: 3,
        icon: 'bi bi-buildings',
        text: 'Compagnies',
        link: '/admin/companies',
      },
      {
        id: 4,
        icon: 'bi bi-truck-front',
        text: 'Bus',
        link: '/admin/bus',
      },
      {
        id: 5,
        icon: 'bi bi-box-seam',
        text: 'Colis',
        link: '/admin/colis',
      },
      {
        id: 6,
        icon: 'bi bi-ticket-perforated',
        text: 'Tickets',
        link: '/admin/tickets',
      },
      {
        id: 7,
        icon: 'bi bi-truck-front',
        text: 'Chauffeurs',
        link: '/admin/drivers',
      },
      {
        id: 8,
        icon: 'bi bi-calendar',
        text: 'Planning',
        link: '/admin/planning',
      },
      {
        id: 9,
        icon: 'bi bi-gear',
        text: 'Configurations',
        children: [
          {
            id: 101,
            text: 'Ma Compagnie',
            link: '/admin/my-company',
            icon: 'bi bi-building'
          },
          {
            id: 102,
            text: 'Utilisateurs',
            link: '/admin/users',
            icon: 'bi bi-users'
          }
        ]
      }
    ];
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
