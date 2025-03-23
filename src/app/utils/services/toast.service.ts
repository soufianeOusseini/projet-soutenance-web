import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastr: ToastrService) {}

  showSuccess(detail = 'Opétation réussi!') {
    this.toastr.success(detail, 'Succès');
  }

  showError(detail = "Une erreur s'est produite") {
    this.toastr.error(detail, 'Erreur');
  }
}
