import {Component, OnInit, OnDestroy} from '@angular/core';
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
export class ProfilComponent implements OnInit, OnDestroy {
  currentUser: any;
  formGroup: FormGroup = new FormGroup({});
  profilePath: any;
  logoFileName: any;
  isEditing: boolean = false;
  isSaving: boolean = false;
  originalUserData: any;

  private _unsubscribeAll: Subject<any> = new Subject();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  loadUserData(): void {
    this.authService.getCurrentUser()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          this.currentUser = data;
          this.originalUserData = { ...data };
          this.formGroup = this.createForm();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des données utilisateur:', error);
        }
      });
  }

  createForm(): FormGroup {
    return this.fb.group({
      profilePath: [this.currentUser?.profilePath],
      firstName: [
        { value: this.currentUser?.firstName, disabled: !this.isEditing },
        [Validators.required, Validators.minLength(2)]
      ],
      lastName: [
        { value: this.currentUser?.lastName, disabled: !this.isEditing },
        [Validators.required, Validators.minLength(2)]
      ],
      email: [
        { value: this.currentUser?.email, disabled: !this.isEditing },
        [Validators.required, Validators.email]
      ],
      phone: [
        { value: this.currentUser?.phone, disabled: !this.isEditing }
      ]
    });
  }

  toggleEdit(): void {
    this.isEditing = true;
    this.formGroup.get('firstName')?.enable();
    this.formGroup.get('lastName')?.enable();
    this.formGroup.get('email')?.enable();
    this.formGroup.get('phone')?.enable();
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.formGroup.patchValue({
      firstName: this.originalUserData.firstName,
      lastName: this.originalUserData.lastName,
      email: this.originalUserData.email,
      phone: this.originalUserData.phone
    });
    this.formGroup.get('firstName')?.disable();
    this.formGroup.get('lastName')?.disable();
    this.formGroup.get('email')?.disable();
    this.formGroup.get('phone')?.disable();
  }

  saveChanges(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const updatedData = {
      firstName: this.formGroup.get('firstName')?.value,
      lastName: this.formGroup.get('lastName')?.value,
      email: this.formGroup.get('email')?.value,
      phone: this.formGroup.get('phone')?.value
    };

    this.userService.updateProfile(updatedData)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (data) => {
          this.currentUser = { ...this.currentUser, ...data };
          this.originalUserData = { ...data };
          this.isEditing = false;
          this.isSaving = false;
          this.formGroup.get('firstName')?.disable();
          this.formGroup.get('lastName')?.disable();
          this.formGroup.get('email')?.disable();
          this.formGroup.get('phone')?.disable();

          // Afficher un message de succès (vous pouvez utiliser un service de notification)
          console.log('Profil mis à jour avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du profil:', error);
          this.isSaving = false;
          // Afficher un message d'erreur
        }
      });
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Validation de la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error('Le fichier est trop volumineux. Taille maximale: 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        this.formGroup.patchValue({ profilePath: reader.result });
        this.logoFileName = file.name;
        this.profilePath = file;
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('profilePath', file);

      this.formGroup.get('profilePath')?.disable();

      this.userService.uploadProfile(formData)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (data) => {
            this.currentUser.profilePath = data.profilePath;
            this.formGroup.get('profilePath')?.enable();
            console.log('Photo de profil mise à jour avec succès');
          },
          error: (error) => {
            console.error('Erreur lors du téléchargement de la photo:', error);
            this.formGroup.get('profilePath')?.enable();
            // Restaurer l'ancienne image
            this.formGroup.patchValue({ profilePath: this.currentUser?.profilePath });
          }
        });
    }
  }

  changePassword(): void {
    // Navigation vers la page de changement de mot de passe
    // ou ouverture d'un modal
    this.router.navigate(['/change-password']);
  }

  protected readonly FileUtility = FileUtility;
}
