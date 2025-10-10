import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {Role} from "../../../../models/role";
import {RoleService} from "../../../../services/role.service";
import {showHttpError, showSuccess} from "../../../../utils/message.util";

@Component({
  selector: 'app-add-role-form',
  standalone: false,
  templateUrl: './add-role-form.component.html',
  styleUrl: './add-role-form.component.css'
})
export class AddRoleFormComponent implements OnInit {
  role: Role = { name: '' };
  formGroup: FormGroup = new FormGroup({});
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.formGroup = this.createForm();
    this.isEditMode = !!this.role.id;
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [this.role.id],
      name: [this.role.name, [Validators.required]]
    });
  }

  save(): void {
    if (this.formGroup.invalid) {
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.roleService
      .createRole(this.formGroup.value)
      .subscribe({
        next: (data) => {
          showSuccess();
          this.activeModal.close('saved');
        },
        error: (error) => {
          showHttpError(error);
          console.error(error);
          this.activeModal.close('error');
        },
      });
  }

  update(): void {
    if (this.formGroup.invalid) {
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.roleService
      .updateRole(this.formGroup.value)
      .subscribe({
        next: (data) => {
          showSuccess();
          this.activeModal.close('updated');
        },
        error: (error) => {
          showHttpError(error);
          console.error(error);
          this.activeModal.close('error');
        },
      });
  }

  reset() {
    this.formGroup.reset();
  }

  close() {
    this.activeModal.close('closed');
  }

  get name() {
    return this.formGroup.get('name');
  }
}
