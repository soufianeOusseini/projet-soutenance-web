import {Component, OnInit} from '@angular/core';
import {Bus} from "../../../models/bus.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {BusService} from "../../../services/bus.service";
import {BusStatus} from "../../../models/enums/bus-status";
import {FileUtility} from "../../../utils/file-util";
import {showHttpError, showSuccess} from "../../../utils/message.util";
import {MessageService} from "primeng/api";

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
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.formGroup = this.createForm();
  }

  initializeExistingImage(): void {
    console.log('Bus object:', this.bus);
    console.log('Bus image:', this.bus.image);

    if (this.bus && this.bus.image) {
      if (this.bus.image.startsWith('http')) {
        this.existingImageUrl = this.bus.image;
        this.imagePreview = this.bus.image;
      } else {
        this.existingImageUrl = `${this.getBaseUrl()}/uploads/${this.bus.image}`;
        this.imagePreview = this.existingImageUrl;
      }
      console.log('Image preview set to:', this.imagePreview);
    }
  }

  private getBaseUrl(): string {
    return 'http://localhost:8000/api';
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


  hasImage(): boolean {
    return !!(this.imagePreview || this.existingImageUrl || (this.bus && this.bus.image));
  }

  getImageUrl(): string | null {
    if (this.imagePreview) {
      return this.imagePreview;
    }

    if (this.existingImageUrl) {
      return this.existingImageUrl;
    }

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
      if (!file.type.startsWith('image/')) {
        this.formGroup.get('image')?.setErrors({ invalidType: true });
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.formGroup.get('image')?.setErrors({ maxSize: true });
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
        this.existingImageUrl = null;
      };
      reader.readAsDataURL(file);

      this.formGroup.get('image')?.setErrors(null);
    } else {
      this.selectedFile = null;
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

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    this.formGroup.patchValue({ image: null });
  }

  save(): void {
    if (this.formGroup.invalid) {
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    Object.keys(this.formGroup.value).forEach(key => {
      if (key !== 'image' && this.formGroup.value[key] !== null && this.formGroup.value[key] !== undefined) {
        formData.append(key, this.formGroup.value[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    } else if (this.existingImageUrl && this.imagePreview) {
      formData.append('keepExistingImage', 'true');
    } else if (!this.imagePreview) {
      formData.append('removeImage', 'true');
    }
    formData.append('bus', JSON.stringify(this.formGroup.value));
    this.busService
      .save(formData)
      .subscribe({
        next: (data) => {
          showSuccess()
          this.isSubmitting = false;
          this.activeModal.close(data);
        },
        error: (error) => {
          showHttpError(error)
          this.isSubmitting = false;
          console.error(error);
        },
      });
  }

  reset() {
    this.formGroup.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.existingImageUrl = null;
    this.isDragOver = false;

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    this.formGroup.patchValue({
      status: BusStatus.AVAILABLE,
      spaceAvailable: 0
    });

    this.bus = new Bus();
  }

  close() {
    this.activeModal.dismiss('close');
  }

  onImageError(event: Event): void {
    console.error('Erreur lors du chargement de l\'image:', event);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected readonly FileUtility = FileUtility;
}
