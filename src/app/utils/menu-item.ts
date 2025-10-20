export interface MenuItem {
  id?: number;
  icon?: string;
  text: string;
  link?: string;
  badge?: {
    text: string;
    type: string;
  };
  active?: boolean;
  children?: MenuItem[];
  permission?: string;
  actions?: MenuAction[];
  roles?: string[];
}

export interface MenuAction {
  label: string;
  permission: string;
  isMenu?: boolean;
  isNotReadable?: boolean;
  isNotEditable?: boolean;
  isNotDeletable?: boolean;
  isNotCreatable?: boolean;
}
