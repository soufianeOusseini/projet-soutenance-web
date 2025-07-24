import {Component, OnInit} from '@angular/core';
import {Bus} from "../../../models/bus.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {BusService} from "../../../services/bus.service";
import {BusStatus} from "../../../models/enums/bus-status";
import {ToastrService} from "ngx-toastr";
import {FileUtility} from "../../../utils/file-util";

@Component({
  selector: 'app-add-form',
  standalone: false,
  templateUrl: './add-bus-form.component.html',
  styleUrl: './add-bus-form.component.css'
})
export class AddBusFormComponent implements OnInit {

  bus: Bus = new Bus();
  formGroup: FormGroup = new FormGroup({});
  isSubmitting = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isDragOver = false;
  existingImageUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private busService: BusService,
  ) {}

  ngOnInit(): void {
    this.formGroup = this.createForm();
    // Ne pas initialiser l'image ici, cela sera fait dans setBusData()
  }

  initializeExistingImage(): void {
    console.log('Bus object:', this.bus);
    console.log('Bus image:', this.bus.image);

    if (this.bus && this.bus.image) {
      // Si c'est une URL complète
      if (this.bus.image.startsWith('http')) {
        this.existingImageUrl = this.bus.image;
        this.imagePreview = this.bus.image;
      } else {
        // Si c'est un chemin relatif, construire l'URL complète
        this.existingImageUrl = `${this.getBaseUrl()}/uploads/${this.bus.image}`;
        this.imagePreview = this.existingImageUrl;
      }
      console.log('Image preview set to:', this.imagePreview);
    }
  }

  // Méthode pour obtenir l'URL de base de votre API
  private getBaseUrl(): string {
    // Remplacez par votre URL d'API de base
    return 'http://localhost:8000/api'; // ou votre URL d'API
  }

  createForm(): FormGroup {
    return this.fb.group(
      {
        id: [this.bus.id],
        plaque: [this.bus.plaque, [Validators.required]],
        model: [this.bus.model, [Validators.required]],
        capacity: [this.bus.capacity, [Validators.required]],
        number: [this.bus.number, [Validators.required]],
        image: [''],
        type: [this.bus.type, [Validators.required]],
        status: [this.bus.status],
        spaceAvailable: [this.bus.spaceAvailable],
      }
    );
  }

  // Méthode pour définir les données du bus (appelée depuis le composant parent)
  setBusData(bus: Bus): void {
    this.bus = bus;

    // D'abord initialiser l'image existante
    this.initializeExistingImage();

    // Ensuite mettre à jour le formulaire
    if (this.formGroup) {
      this.formGroup.patchValue(bus);
    }
  }

  // Méthode pour vérifier si une image est disponible
  hasImage(): boolean {
    return !!(this.imagePreview || this.existingImageUrl || (this.bus && this.bus.image));
  }

  // Méthode pour obtenir l'URL de l'image
  getImageUrl(): string | null {
    // Priorité : nouveau fichier sélectionné
    if (this.imagePreview) {
      return this.imagePreview;
    }

    // Si pas de nouveau fichier, utiliser l'image existante
    if (this.existingImageUrl) {
      return this.existingImageUrl;
    }

    // Fallback sur FileUtility si disponible
    if (this.bus && this.bus.image) {
      return FileUtility.getImageUrl(this.bus.image);
    }

    return null;
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    this.handleFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File | undefined): void {
    if (file) {
      // Validation du type de fichier
      if (!file.type.startsWith('image/')) {
        this.formGroup.get('image')?.setErrors({ invalidType: true });
        return;
      }

      // Validation de la taille (ex: max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.formGroup.get('image')?.setErrors({ maxSize: true });
        return;
      }

      this.selectedFile = file;

      // Créer l'aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
        // Effacer l'URL existante car on a un nouveau fichier
        this.existingImageUrl = null;
      };
      reader.readAsDataURL(file);

      // Nettoyer les erreurs si le fichier est valide
      this.formGroup.get('image')?.setErrors(null);
    } else {
      this.selectedFile = null;
      // Ne pas réinitialiser imagePreview ici si on est en mode édition
      if (!this.existingImageUrl) {
        this.imagePreview = null;
      }
    }
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.imagePreview = null;
    this.existingImageUrl = null;

    // Réinitialiser le champ file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // Marquer que l'image doit être supprimée si c'était une image existante
    this.formGroup.patchValue({ image: null });
  }

  save(): void {
    if (this.formGroup.invalid) {
      // Marquer tous les champs comme touchés pour déclencher l'affichage des erreurs
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Créer FormData pour l'envoi avec fichier
    const formData = new FormData();

    // Ajouter tous les champs du formulaire
    Object.keys(this.formGroup.value).forEach(key => {
      if (key !== 'image' && this.formGroup.value[key] !== null && this.formGroup.value[key] !== undefined) {
        formData.append(key, this.formGroup.value[key]);
      }
    });

    // Gestion de l'image
    if (this.selectedFile) {
      // Nouvelle image sélectionnée
      formData.append('image', this.selectedFile, this.selectedFile.name);
    } else if (this.existingImageUrl && this.imagePreview) {
      // Garder l'image existante (ne pas envoyer de nouveau fichier)
      formData.append('keepExistingImage', 'true');
    } else if (!this.imagePreview) {
      // Supprimer l'image (si elle existait)
      formData.append('removeImage', 'true');
    }
    formData.append('bus', JSON.stringify(this.formGroup.value));
    this.busService
      .save(formData)
      .subscribe({
        next: (data) => {
          this.isSubmitting = false;
          this.activeModal.close(data);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error(error);
          // On ne ferme pas le modal en cas d'erreur pour permettre à l'utilisateur de corriger
        },
      });
  }

  reset() {
    this.formGroup.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.existingImageUrl = null;
    this.isDragOver = false;

    // Réinitialiser le champ file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // Réinitialiser les valeurs par défaut pour status et spaceAvailable
    this.formGroup.patchValue({
      status: BusStatus.AVAILABLE,
      spaceAvailable: 0
    });

    // Réinitialiser l'objet bus
    this.bus = new Bus();
  }

  close() {
    this.activeModal.dismiss('close');
  }

  // Méthode pour gérer les erreurs d'image
  onImageError(event: Event): void {
    console.error('Erreur lors du chargement de l\'image:', event);
    // Optionnel : réinitialiser l'aperçu en cas d'erreur
    // this.imagePreview = null;
  }

  // Méthodes utilitaires pour la validation des formulaires
  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected readonly FileUtility = FileUtility;
}
