import {MenuAction} from "../../../utils/menu-item";

export const DASHBOARD_ACTIONS: MenuAction[] = [
  {
    label: "Dashboard",
    permission: "DASHBOARD"
  }
];

export const TRIPS_ACTIONS: MenuAction[] = [
  {
    label: "Trajets",
    permission: "TRIPS"
  }
];

export const COMPANIES_ACTIONS: MenuAction[] = [
  {
    label: "Compagnies",
    permission: "COMPANIES"
  }
];

export const BUS_ACTIONS: MenuAction[] = [
  {
    label: "Bus",
    permission: "BUS"
  }
];

export const COLIS_ACTIONS: MenuAction[] = [
  {
    label: "Colis",
    permission: "COLIS"
  }
];

export const TICKETS_ACTIONS: MenuAction[] = [
  {
    label: "Tickets",
    permission: "TICKETS"
  }
];

export const DRIVERS_ACTIONS: MenuAction[] = [
  {
    label: "Chauffeurs",
    permission: "DRIVERS"
  }
];

export const PLANNING_ACTIONS: MenuAction[] = [
  {
    label: "Planning",
    permission: "PLANNING"
  }
];

export const COMPTES_ACTIONS: MenuAction[] = [
  {
    label: "Menu Comptes",
    permission: "MENU_COMPTES",
    isMenu: true,
    isNotCreatable: true,
    isNotEditable: true,
    isNotDeletable: true,
  },
  {
    label: "Rôles",
    permission: "ROLES"
  },
  {
    label: "Permissions",
    permission: "PERMISSIONS"
  },
  {
    label: "Utilisateurs",
    permission: "USERS"
  }
];

export const CONFIGURATIONS_ACTIONS: MenuAction[] = [
  {
    label: "Menu Configurations",
    permission: "MENU_CONFIGURATIONS",
    isMenu: true,
    isNotCreatable: true,
    isNotEditable: true,
    isNotDeletable: true,
  },
  {
    label: "Ma Compagnie",
    permission: "MY_COMPANY"
  },
  {
    label: "Utilisateurs",
    permission: "USERS"
  }
];

// export const BILLING_ACTIONS: MenuAction[] = [
//   {
//     label: "Menu Facturation",
//     permission: "MENU_FACTURATION",
//     isMenu: true,
//     isNotCreatable: true,
//     isNotEditable: true,
//     isNotDeletable: true,
//   },
//   {
//     label: "Plan Abonnement",
//     permission: "SUBSCRIPTION_PLAN",
//   },
//   {
//     label: "Abonnement",
//     permission: "SUBSCRIPTION",
//   },
//   {
//     label: "Facture",
//     permission: "INVOICE",
//   }
// ]
