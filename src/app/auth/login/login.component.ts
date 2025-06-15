import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../service/auth.service";
import {User} from "../../models/user";
import {StatusCodes} from "http-status-codes";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    standalone: false
})
export class LoginComponent implements OnInit {

  user: User = new User();
  returnUrl = '/';
  loading = false;
  error = '';
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.authService.logout();

    if (this.router.url.indexOf('/auth/logout') > -1) {
      window.location.href = '/';
    }
  }

  login() {
    this.authService.login(this.user).subscribe({
      next: (data) => {
        window.location.href = this.returnUrl;
        console.log("Auth OK");
      },
      error: (error) => {
        if (StatusCodes.UNAUTHORIZED == error.status) {
          this.error = 'Identifiants incorrecte ou compte non activé';
        } else {
          this.error = '';
        }

        this.loading = false;
      },
    });
  }
}

