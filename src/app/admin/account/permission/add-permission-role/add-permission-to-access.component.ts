import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import {Role} from "../../../../models/role";
import {Permission} from "../../../../models/permission";
import {PermissionService} from "../../../../services/permission.service";
import {RoleService} from "../../../../services/role.service";

@Component({
  selector: 'app-add-permission-to-access',
  templateUrl: './add-permission-to-access.component.html',
  styleUrl: './add-permission-to-access.component.css',
  standalone: false
})
export class AddPermissionToAccessComponent implements OnInit, OnDestroy {
  roles: Role[] = [];
  menu: any;
  selectedRole?: Role;
  permissionsToRole: Permission[] = [];
  loading: boolean = false;
  permissions: Permission[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private permissionService: PermissionService,
    private roleService: RoleService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
  }

  updatePermission(checked: any, permission: string, action: string): void {
    if (!this.selectedRole) return;

    const perm = permission + "_" + action;

    if (checked.target.checked) {
      this.permissionService
        .addPermissionToRole(this.selectedRole.id!, perm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.getRoleById(this.selectedRole!.id!);
          },
          error: (error) => {
            console.error('Erreur lors de l\'ajout de la permission:', error);
            checked.target.checked = false;
          },
        });
    } else {
      this.permissionService
        .removePermissionsFromRole(this.selectedRole.id!, [perm])
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.getRoleById(this.selectedRole!.id!);
          },
          error: (error) => {
            console.error('Erreur lors de la suppression de la permission:', error);
            checked.target.checked = true;
          },
        });
    }
  }

  getRoleById(id: number): void {
    this.roleService
      .getRoleById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.permissionsToRole = data?.permissions || [];
        },
        error: (error) => {
          console.error('Erreur lors du chargement du rôle:', error);
        },
      });
  }

  addAllPermissionToRole(checked: any, permission: string): void {
    if (!this.selectedRole) return;

    const actions = ["ADD", "EDIT", "DELETE", "READ"];
    const permissionNames: string[] = [];

    actions.forEach(action => {
      if (this.permissionExists(permission, action)) {
        permissionNames.push(permission + "_" + action);
      }
    });

    if (permissionNames.length === 0) return;

    if (checked.target.checked) {
      this.permissionService
        .addPermissionsToRole(this.selectedRole.id!, permissionNames)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.getRoleById(this.selectedRole!.id!);
          },
          error: (error) => {
            console.error('Erreur lors de l\'ajout des permissions:', error);
            checked.target.checked = false;
          },
        });
    } else {
      this.permissionService
        .removePermissionsFromRole(this.selectedRole.id!, permissionNames)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.getRoleById(this.selectedRole!.id!);
          },
          error: (error) => {
            console.error('Erreur lors de la suppression des permissions:', error);
            checked.target.checked = true;
          },
        });
    }
  }

  checkAllAccess(permission: string): boolean {
    const actions = ["ADD", "EDIT", "DELETE", "READ"];
    const requiredPermissions: string[] = [];

    actions.forEach(action => {
      if (this.permissionExists(permission, action)) {
        requiredPermissions.push(permission + "_" + action);
      }
    });

    if (requiredPermissions.length === 0) return false;

    return requiredPermissions.every(perm =>
      this.permissionsToRole.some(p => p.name === perm)
    );
  }

  permissionExists(permission: string, action: string): boolean {
    return this.permissions?.some(p => p.name === permission + "_" + action);
  }

  onRoleChange(): void {
    if (this.selectedRole) {
      this.getRoleById(this.selectedRole.id!);
    }
  }

  checkAccess(permission: string, action: string): boolean {
    return this.permissionsToRole.some(
      p => p.name === permission + "_" + action
    );
  }

  close(): void {
    this.activeModal.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
