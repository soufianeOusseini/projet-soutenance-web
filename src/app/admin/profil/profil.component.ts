import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../auth/service/auth.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent implements OnInit{
  currentUser : any
  email: any
  constructor(private authService: AuthService,private router: Router,private route: ActivatedRoute,) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.email = params['email'];
    });
    this.authService.getCurrentUser().subscribe({
      next: (data) => {
        this.currentUser = data
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
