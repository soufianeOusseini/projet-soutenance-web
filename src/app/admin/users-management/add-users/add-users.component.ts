import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {User} from "../../../models/user";
import {UserService} from "../../../services/user.service";
@Component({
  selector: 'app-add-users',
  standalone: false,
  templateUrl: './add-users.component.html',
  styleUrl: './add-users.component.css'
})
export class AddUsersComponent implements OnInit{

  formGroup: FormGroup;
  isSubmitting = false;
  user: User| null = null;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private userService: UserService,
  ) {
    this.formGroup = this.createFormGroup();
  }

  ngOnInit(): void {
    if (this.user) {
      this.populateForm();
    }
  }

  private createFormGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9\s\-\(\)]{8,}$/)]],
      profile: ['', [Validators.required]]
    });
  }

  private populateForm(): void {
    if (this.user) {
      this.formGroup.patchValue({
        id: this.user.id,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.username,
        phone: this.user.phone,
        profile: this.user.profile
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  save(): void {
    if (this.formGroup.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.formGroup.value;

      // Créer l'objet UserDTO
      const userDto: any = {
        id: formData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        profile: formData.profile,
        username: this.generateUsername(formData.firstName, formData.lastName),
        password: this.generateTemporaryPassword()
      };

      const operation = userDto.id ?
        this.userService.updateUser(userDto) :
        this.userService.createUser(userDto);

      operation.subscribe({
        next: (response) => {
          const message = userDto.id ?
            'Utilisateur modifié avec succès' :
            'Utilisateur créé avec succès';
          this.activeModal.close(response);
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  reset(): void {
    this.formGroup.reset();
    Object.keys(this.formGroup.controls).forEach(key => {
      this.formGroup.get(key)?.setErrors(null);
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.formGroup.controls).forEach(key => {
      this.formGroup.get(key)?.markAsTouched();
    });
  }

  private generateUsername(firstName: string, lastName: string): string {
    const cleanFirstName = firstName.toLowerCase().replace(/\s+/g, '');
    const cleanLastName = lastName.toLowerCase().replace(/\s+/g, '');
    return `${cleanFirstName}.${cleanLastName}`;
  }

  private generateTemporaryPassword(): string {
    // Génère un mot de passe temporaire de 8 caractères
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Getter pour faciliter l'accès aux contrôles du formulaire
  get f() {
    return this.formGroup.controls;
  }
}
