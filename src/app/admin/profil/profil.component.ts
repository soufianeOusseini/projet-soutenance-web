import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../auth/service/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FileUtility} from "../../utils/file-util";
import {Subject, takeUntil} from "rxjs";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-profil',
  standalone: false,
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css'
})
export class ProfilComponent implements OnInit{
  currentUser : any
  email: any
  formGroup: FormGroup = new FormGroup({});
  profilePath: any;
  logoFileName: any;
  private _unsubscribeAll: Subject<any> = new Subject();
  constructor(private fb: FormBuilder,private authService: AuthService,private router: Router,private route: ActivatedRoute,private userService: UserService) {
  }

  ngOnInit(): void {
    this.formGroup = this.createForm();
    this.authService.getCurrentUser().subscribe({
      next: (data) => {
        this.currentUser = data
        this.formGroup = this.createForm();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
  createForm(): FormGroup {
    return this.fb.group({
      profilePath: [this.currentUser?.profilePath],
    });
  }
  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.formGroup.patchValue({ profilePath: reader.result });
        this.logoFileName = file.name;
        this.profilePath = file;
      };
      reader.readAsDataURL(file);
      const formData = new FormData();

      this.formGroup.value.logoPath = null;
      formData.append('profilePath', file);
      this.formGroup.disable();

      // Remplacez par votre service de compagnie
      this.userService
        .uploadProfile(formData)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (data) => {
            //this.getCompanyData();
            location.reload();
          },
          error: (error) => {
            console.error(error);
            this.formGroup.enable();
          },
        });
    }
  }

  protected readonly FileUtility = FileUtility;
}
