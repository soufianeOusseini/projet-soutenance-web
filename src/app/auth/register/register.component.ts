import { Component } from '@angular/core';
import {User} from "../../models/user";
import {AuthService} from "../service/auth.service";
import {ToastService} from "../../utils/services/toast.service";

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrl: './register.component.css',
    standalone: false
})
export class RegisterComponent {

 user: User = new User();

  userCreated = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}
  confirm: string | undefined;

  saveUser() {
    this.authService.checkUsernameExists(this.user.username).subscribe({
      next: (userExists) => {
        if (userExists) {
          this.toastService.showError("L'adresse email est déjà utilisé!");
        } else {
          this.authService.signup(this.user).subscribe({
            next: (data) => {
              this.user = new User();
              this.userCreated = true;
              this.toastService.showSuccess('Votre compte a été créé!');
            },
            error: (error) => {
              this.toastService.showError('Echec de la création du compte');
              console.error(error);
            },
          });
        }
      },
      error: (error) => {
        this.toastService.showError('Echec de la création du compte');
        console.error(error);
      },
    });
  }

  cancel() {
    window.location.href = '/';
  }

  passwordsNotMatch(): boolean {
    return (
      (!!this.user.password || !!this.confirm) &&
      this.user.password != this.confirm
    );
  }

  emailNotValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return !!this.user.username && !emailRegex.test(this.user.username);
  }

  formNotComplete(): boolean {
    return (
      !this.user.username ||
      !this.user.password ||
      !this.confirm ||
      this.passwordsNotMatch() ||
      !this.user.name ||
      !this.user.lastName ||
      this.emailNotValid()
    );
  }
}

