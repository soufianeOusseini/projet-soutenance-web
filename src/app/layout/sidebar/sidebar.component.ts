import {Component, OnInit} from '@angular/core';
import {MenuItem} from "../../utils/menu-item";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];
  openMenuIds: Set<number> = new Set();
  constructor() { }

  ngOnInit(): void {
    this.initializeMenu();
  }

  initializeMenu(): void {
    this.menuItems = [
      {
        id: 1,
        icon: 'bi bi-speedometer2',
        text: 'Dashboard',
        link: '/admin/dashboard',
        active: true
      },

      {
        id: 2,
        icon: 'bi bi-car-front',
        text: 'Trips',
        link: '/trips',
        badge: {
          text: 'New',
          type: 'danger'
        }
      },
      {
        id: 3,
        icon: 'bi bi-car-front',
        text: 'Compagnies',
        link: '/admin/companies',
      },

      {
        id: 4,
        icon: 'bi bi-calendar2',
        text: 'Calendars',
        children: [
          {
            text: 'Daygrid View',
            link: '/calendar'
          },
          {
            text: 'External Draggable',
            link: '/calendar-external-draggable'
          },
          {
            text: 'Google Calendar',
            link: '/calendar-google'
          }
        ]
      },
    ];
  }

  hasChildren(menuItem: MenuItem): boolean {
    return !!menuItem.children && menuItem.children.length > 0;
  }

  toggleMenu(item: MenuItem, event: Event): void {
    event.preventDefault();

    if (!item.id) {
      return;
    }

    if (this.openMenuIds.has(item.id)) {
      this.openMenuIds.delete(item.id);
    } else {
      this.openMenuIds.add(item.id);
    }
  }

  isMenuOpen(item: MenuItem): boolean {
    return !!item.id && this.openMenuIds.has(item.id);
  }

}
