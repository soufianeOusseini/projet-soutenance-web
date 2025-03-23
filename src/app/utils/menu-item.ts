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
}
