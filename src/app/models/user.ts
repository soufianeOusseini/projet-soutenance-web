import { BaseEntity } from './base-entiry';

export class User extends BaseEntity {
  username: string;
  password: string;
  name: string;
  lastname: string;
  token: string;
  rtoken: string;
  contact: string;
  enabled: boolean = true;
  accountNonLocked: boolean = true;
  credentialsNonExpired: boolean = true;
  accountNonExpired: boolean = true;

  admin: boolean = false;

  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.name = '';
    this.lastname = '';
    this.token = '';
    this.rtoken = '';
    this.contact = '';
  }
}
