
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {RoleService} from "../../../services/role.service";
import {ProfileService} from "../../../services/profile.service";
import {UserService} from "../../../services/user.service";
import {UserProfile} from "../../../models/enums/user-profile";
import {Profile} from "../../../models/profile.model";

@Component({
  selector: 'app-add-staff-form',
  standalone: false,
  templateUrl: './add-staff-form.component.html',
  styleUrl: './add-staff-form.component.css'
})

export class AddStaffFormComponent implements OnInit {

  formGroup: FormGroup = new FormGroup({});
  roles: any[] = [];
  userProfiles = UserProfile; // Pour accéder à l'enum dans le template

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
  }

  initForm(): void {
    this.formGroup = this.formBuilder.group({
      id: [null],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      username: ['', Validators.required],
      password: ['', Validators.required],
      defaultLanguage: ['FR'],
      roleId: ['', Validators.required],
      profile: [UserProfile.ADMIN] // Valeur par défaut
    });
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  save(): void {
    if (this.formGroup.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formData = this.formGroup.value;

    // Préparer l'objet user correctement
    const user = {
      id: formData.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      username: formData.username,
      password: formData.password,
      defaultLanguage: formData.defaultLanguage,
      passwordReseted: false,
      roles: [{ id: formData.roleId }],
      // Créer un profil correctement formaté
      profiles: [
        {
          name: formData.profile // Utiliser directement la valeur de l'enum
        }
      ]
    };

    // Pour le débogage
    console.log('Données de l\'utilisateur à envoyer:', user);

    if (user.id) {
      // Mode édition
      this.userService.updateUser(user).subscribe({
        next: (result) => {
          this.activeModal.close(result);
        },
        error: (error) => {
          console.error('Error updating user:', error);
        }
      });
    } else {
      // Mode création
      this.userService.createUser(user).subscribe({
        next: (result) => {
          this.activeModal.close(result);
        },
        error: (error) => {
          console.error('Error creating user:', error);
        }
      });
    }
  }

  reset(): void {
    this.formGroup.reset({
      defaultLanguage: 'FR',
      profile: UserProfile.ADMIN
    });
  }

  setUser(user: any): void {
    if (!user) return;

    // Extraire les IDs des rôles et le profil
    const roleId = user.roles && user.roles.length > 0 ? user.roles[0].id : '';
    const profile = user.profiles && user.profiles.length > 0 ? user.profiles[0].name : UserProfile.ADMIN;

    this.formGroup.patchValue({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      username: user.username,
      defaultLanguage: user.defaultLanguage || 'FR',
      roleId: roleId,
      profile: profile
    });

    // Supprimer la validation obligatoire du mot de passe en mode édition
    this.formGroup.get('password')?.clearValidators();
    this.formGroup.get('password')?.updateValueAndValidity();
  }
}
