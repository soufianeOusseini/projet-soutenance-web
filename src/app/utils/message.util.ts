import { HttpErrorResponse } from '@angular/common/http'
import { MessageService } from 'primeng/api'
import Swal from 'sweetalert2'
import {StaticInjector} from "../app.module";

class StaticHolder {
  static messageService: MessageService

  public static initIfRequired(): boolean {
    if (StaticHolder.messageService == null) {
      if (!StaticInjector) {
        console.error('StaticInjector is not initialized');
        return false;
      }

      try {
        StaticHolder.messageService = StaticInjector.get<MessageService>(MessageService);
        return true;
      } catch (error) {
        console.error('Error getting MessageService:', error);
        return false;
      }
    }
    return true;
  }
}

// Fonctions avec le style de votre application

// Message de succès avec le style de votre toast réseau
export function showCustomSuccess(title: string = 'Succès', message: string = 'Opération réussie', duration: number = 4000): void {
  if (!StaticHolder.initIfRequired()) {
    console.warn('MessageService not available, using SweetAlert fallback');
    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      timer: 2500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
    return;
  }

  StaticHolder.messageService.clear('success-custom');
  StaticHolder.messageService.add({
    key: 'success-custom',
    summary: title,
    detail: message,
    life: duration
  });
}

// Message d'erreur personnalisé
export function showCustomError(title: string = 'Erreur', message: string = 'Opération échouée', duration: number = 5000): void {
  if (!StaticHolder.initIfRequired()) {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
    return;
  }

  StaticHolder.messageService.clear('error-custom');
  StaticHolder.messageService.add({
    key: 'error-custom',
    summary: title,
    detail: message,
    life: duration
  });
}

// Message d'avertissement personnalisé
export function showCustomWarning(title: string = 'Attention', message: string = 'Veuillez vérifier', duration: number = 6000): void {
  if (!StaticHolder.initIfRequired()) {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
    return;
  }

  StaticHolder.messageService.clear('warning-custom');
  StaticHolder.messageService.add({
    key: 'warning-custom',
    summary: title,
    detail: message,
    life: duration
  });
}

// Message d'information personnalisé
export function showCustomInfo(title: string = 'Information', message: string = 'À noter', duration: number = 4000): void {
  if (!StaticHolder.initIfRequired()) {
    Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      timer: 2500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
    return;
  }

  StaticHolder.messageService.clear('info-custom');
  StaticHolder.messageService.add({
    key: 'info-custom',
    summary: title,
    detail: message,
    life: duration
  });
}

// Fonctions spécialisées pour les opérations CRUD

// Succès de création
export function showCreateSuccess(entity: string = 'élément'): void {
  showCustomSuccess(
    '✓ Création réussie',
    `${entity.charAt(0).toUpperCase() + entity.slice(1)} créé avec succès`
  );
}

// Succès de modification
export function showUpdateSuccess(entity: string = 'élément'): void {
  showCustomSuccess(
    '✓ Modification réussie',
    `${entity.charAt(0).toUpperCase() + entity.slice(1)} modifié avec succès`
  );
}

// Succès de suppression
export function showDeleteSuccess(entity: string = 'élément'): void {
  showCustomSuccess(
    '✓ Suppression réussie',
    `${entity.charAt(0).toUpperCase() + entity.slice(1)} supprimé avec succès`
  );
}

// Erreur de validation
export function showValidationError(message: string = 'Veuillez vérifier les données saisies'): void {
  showCustomError('Erreur de validation', message);
}

// Erreur réseau
export function showNetworkError(): void {
  showCustomError(
    'Erreur de connexion',
    'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
  );
}

// Anciennes fonctions adaptées pour compatibilité

export function showSuccess(message?: string): void {
  showCustomSuccess('Succès', message || 'Opération réussie');
}

export function showError(message?: string, durationMillisecond: number = 3000): void {
  showCustomError('Erreur', message || 'Opération échouée', durationMillisecond);
}

export function showHttpError(error: HttpErrorResponse): void {
  const isWarning = error?.status == 406;
  let message = !error?.error?.message || error?.error?.message == 'No message available'
    ? 'Opération échouée'
    : error?.error?.message;

  if (isWarning) {
    showCustomWarning('Avertissement', message);
  } else {
    showCustomError('Erreur HTTP', message);
  }
}

export function showErrorPositionCenter(error?: HttpErrorResponse | string, durationMillisecond: number = 3000): void {
  const message = error instanceof HttpErrorResponse
    ? error?.error || 'Opération échouée'
    : error || 'Opération échouée';

  showCustomError('Erreur', message, durationMillisecond);
}

export function showWarning(warningMessage?: string, durationMillisecond: number = 5000): void {
  showCustomWarning('Avertissement', warningMessage || 'Attention requise', durationMillisecond);
}

export function showWarnings(messageService: MessageService, warningMessage?: string, durationMillisecond: number = 3000): void {
  messageService.add({
    severity: 'warn',
    summary: 'Avertissement',
    detail: warningMessage,
    key: 'message',
    life: durationMillisecond,
  });
}

export function showInfo(message: string, durationMillisecond: number = 3000): void {
  showCustomInfo('Information', message, durationMillisecond);
}

// Toutes les fonctions SweetAlert2 existantes restent inchangées
export function basicAlert() {
  Swal.fire({
    title: 'Welcome to Your Admin Page',
    confirmButtonColor: '#0162e8',
  })
}

export function titleAlert() {
  Swal.fire({
    title: 'Here is a title!',
    text: 'All are available in the template',
    confirmButtonColor: '#0162e8',
  })
}

export function successAlert() {
  Swal.fire({
    icon: 'success',
    title: 'Success',
    text: 'Opération éffectuée avec success',
    timer: 1500,
    showConfirmButton: false,
  })
}

export function errorAlert() {
  Swal.fire({
    icon: 'error',
    title: 'Erreur',
    text: 'Opération échouée',
    timer: 2000,
    showConfirmButton: false,
  })
}

export function showConfirmDelete(value: any, deleteOrg: any) {
  Swal.fire({
    title: 'Êtes vous sûr',
    text: 'de supprimer cet élement',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Oui',
    cancelButtonText: 'Annuler',
    customClass: {
      cancelButton: 'btn btn-secondary',
      confirmButton: 'btn btn-danger ml-1',
    },
  }).then(function (result) {
    if (result.value) {
      deleteOrg(value)
      Swal.fire({
        title: 'SUPPRIMER',
        text: 'Element supprimé avec success',
        icon: 'success',
        timer: 500,
        showConfirmButton: false,
      })
    }
  })
}

export function warningAlert() {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure ?',
    text: 'Your will not be able to recover this imaginary file!',
    showCancelButton: true,
    confirmButtonColor: '#0162e8',
    cancelButtonColor: '#0162e8',
    confirmButtonText: 'Yes, delete it!',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Deleted!',
        text: 'Your imaginary file has been deleted.',
        icon: 'success',
        confirmButtonColor: '#0162e8',
      })
    }
  })
}

export function parameterAlert() {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You will not be able to recover this imaginary file!',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    confirmButtonColor: '#0162e8',
    cancelButtonText: 'No, cancel it!',
    cancelButtonColor: '#0162e8',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Deleted!',
        text: 'Your imaginary file has been deleted.',
        icon: 'success',
        confirmButtonColor: '#0162e8',
      })
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: 'Cancelled!',
        text: 'Your imaginary file is safe :)',
        icon: 'error',
        confirmButtonColor: '#0162e8',
      })
    }
  })
}

export function imageAlert() {
  Swal.fire({
    title: 'Lovely',
    text: 'Your image is uploaded.',
    imageUrl: './assets/images/brand/logo.png',
    confirmButtonColor: '#0162e8',
  })
}

export function timerAlert() {
  Swal.fire({
    title: 'Auto close alert!',
    text: 'I will close in 2 seconds.',
    confirmButtonColor: '#0162e8',
    timer: 2000,
    timerProgressBar: true,
  })
}

export function animationFadeAlert() {
  Swal.fire({
    title: 'Custom Fade animation with Animate.css',
    showClass: {
      popup: 'animate__animated animate__fadeInDown',
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp',
    },
    confirmButtonColor: '#0162e8',
  })
}

export function animationRotateAlert() {
  Swal.fire({
    title: 'Custom Rotate animation with Animate.css',
    showClass: {
      popup: 'animate__animated animate__rotateInDownLeft',
    },
    hideClass: {
      popup: 'animate__animated animate__rotateOutUpRight',
    },
    confirmButtonColor: '#0162e8',
  })
}

export function animationZoomAlert() {
  Swal.fire({
    title: 'Custom Rotate animation with Animate.css',
    showClass: {
      popup: 'animate__animated animate__zoomInRight',
    },
    hideClass: {
      popup: 'animate__animated animate__zoomOutLeft',
    },
    confirmButtonColor: '#0162e8',
  })
}

export function animationSlideAlert() {
  Swal.fire({
    title: 'Custom Slide animation with Animate.css',
    showClass: {
      popup: 'animate__animated animate__slideInLeft',
    },
    hideClass: {
      popup: 'animate__animated animate__slideOutLeft',
    },
    confirmButtonColor: '#0162e8',
  })
}

export function animationBounceAlert() {
  Swal.fire({
    title: 'Custom Bounce animation with Animate.css',
    showClass: {
      popup: 'animate__animated animate__bounceInRight',
    },
    hideClass: {
      popup: 'animate__animated animate__bounceOutLeft',
    },
    confirmButtonColor: '#0162e8',
  })
}
