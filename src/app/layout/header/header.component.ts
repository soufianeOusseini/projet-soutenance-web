import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../auth/service/auth.service";
import {Router} from "@angular/router";
import {FileUtility} from "../../utils/file-util";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: false
})
export class HeaderComponent implements OnInit{
  currentUser: any;

  constructor(public authService: AuthService, public router: Router) {
  }

  profil(): void {
    this.router.navigate(['admin/profil']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (data) => {
        this.currentUser = data
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  protected readonly FileUtility = FileUtility;
}
