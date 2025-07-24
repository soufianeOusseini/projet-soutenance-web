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
  currentUrl: string = '';
  accordionMode: boolean = true; // Activer/désactiver le mode accordion

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
        icon: 'bi bi-speedometer2', // Dashboard
        text: 'Dashboard',
        link: '/admin/dashboard'
      },
      {
        id: 2,
        icon: 'bi bi-signpost-split', // Trajets
        text: 'Trajets',
        link: '/trips',
        badge: {
          text: 'New',
          type: 'danger'
        }
      },
      {
        id: 3,
        icon: 'bi bi-buildings', // Compagnies
        text: 'Compagnies',
        link: '/admin/companies',
      },
      {
        id: 4,
        icon: 'bi bi-truck-front', // Bus
        text: 'Bus',
        link: '/admin/bus',
      },
      {
        id: 5,
        icon: 'bi bi-box-seam', // Colis
        text: 'Colis',
        link: '/admin/colis',
      },
      {
        id: 6,
        icon: 'bi bi-ticket-perforated', // Tickets
        text: 'Tickets',
        link: '/admin/tickets',
      },
      {
        id: 7,
        icon: 'bi bi-calendar-check', // Réservations
        text: 'Reservations',
        link: '/admin/reservations',
      },
      {
        id: 8,
        icon: 'bi bi-gear', // Paramètres / Config
        text: 'Configurations',
        children: [
          {
            text: 'Ma Compagnie',
            link: '/admin/my-company', // Correction du typo
            icon: 'bi bi-building'
          },
        ]
      },
    ];
  }

  updateActiveMenuItem(): void {
    // Réinitialiser tous les menus comme inactifs
    this.resetActiveState(this.menuItems);

    // Marquer le menu actuel comme actif
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
      // Vérifier si c'est un lien direct
      if (item.link && this.isActiveRoute(item.link, currentUrl)) {
        item.active = true;
        // Si c'est un sous-menu, ouvrir le parent automatiquement
        if (item.id) {
          this.openMenu(item.id);
        }
        return true;
      }

      // Vérifier les enfants
      if (item.children && this.setActiveMenuItem(item.children, currentUrl)) {
        // Si un enfant est actif, marquer le parent comme actif aussi et l'ouvrir
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
    // Comparaison exacte
    if (currentUrl === menuLink) {
      return true;
    }

    // Comparaison avec préfixe (pour les routes avec paramètres)
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
      // Si le mode accordion est activé, fermer les autres menus
      if (this.accordionMode) {
        this.closeAllMenusExcept(item.id);
      }
      this.openMenu(item.id);
    }
  }

  openMenu(menuId: number): void {
    this.openMenuIds.add(menuId);
  }

  closeMenu(menuId: number): void {
    this.openMenuIds.delete(menuId);
  }

  closeAllMenus(): void {
    this.openMenuIds.clear();
  }

  closeAllMenusExcept(exceptId: number): void {
    const menusToClose = Array.from(this.openMenuIds).filter(id => id !== exceptId);
    menusToClose.forEach(id => this.closeMenu(id));
  }

  openMenuWithChildren(item: MenuItem): void {
    if (item.id && this.hasChildren(item)) {
      this.openMenuIds.add(item.id);
    }
  }

  // Méthode pour activer/désactiver le mode accordion
  toggleAccordionMode(): void {
    this.accordionMode = !this.accordionMode;
  }

  isMenuOpen(item: MenuItem): boolean {
    return !!item.id && this.openMenuIds.has(item.id);
  }

  isMenuActive(item: MenuItem): boolean {
    return !!item.active;
  }
}
