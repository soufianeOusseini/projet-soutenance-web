import { BaseEntity } from './base-entiry';
import {Role} from "./role.model";
import {Profile} from "./profile.model";
import {UserProfile} from "./enums/user-profile";

export class User extends BaseEntity {
  username: string;
  password: string;
  name: string;
  lastname: string;
  firstName: string;
  token: string;
  rtoken: string;
  phone: string;
  enabled: boolean = true;
  accountNonLocked: boolean = true;
  credentialsNonExpired: boolean = true;
  accountNonExpired: boolean = true;
  roles: Role[] = [];
  profiles: null | undefined;
  profile: UserProfile | undefined;
  admin: boolean = false;

  constructor() {
    super();
    this.username = '';
    this.password = '';
    this.name = '';
    this.lastname = '';
    this.token = '';
    this.rtoken = '';
    this.phone = '';
    this.firstName = '';
  }
}
