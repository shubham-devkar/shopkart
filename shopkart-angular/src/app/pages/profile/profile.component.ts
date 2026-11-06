import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ProfileService,
  UserProfile
} from '../../services/profile.service';

interface StoredUser {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
  token?: string;
  profilePhotoUrl?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="profile-page">
      <section class="profile-card">

        <a routerLink="/" class="back-link">
          ← Back to ShopKart
        </a>

        <h1>My Profile</h1>

        <p class="subtitle">
          Manage your account and profile photo.
        </p>

        <div *ngIf="loading" class="message">
          Loading profile...
        </div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <ng-container *ngIf="!loading && profile">

          <div class="avatar-area">

            <div class="avatar-wrapper">

              <img
                *ngIf="photoPreview || photoUrl"
                class="avatar"
                [src]="photoPreview || photoUrl"
                alt="Profile photo"
                (error)="onImageError($event)"
              />

              <div
                *ngIf="!photoPreview && !photoUrl"
                class="avatar avatar-placeholder"
              >
                {{ profile.name.charAt(0).toUpperCase() }}
              </div>

              <label
                for="profilePhoto"
                class="camera-button"
                title="Change profile photo"
                aria-label="Choose profile photo"
              >
                <i class="bi bi-camera-fill"></i>
              </label>

              <input
                id="profilePhoto"
                class="hidden-photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                (change)="onFileSelected($event)"
              />

            </div>

            <h2>{{ profile.name }}</h2>
            <p>{{ profile.email }}</p>

            <p class="photo-hint">
              Click the camera icon to change your photo.
            </p>

            <button
              type="button"
              class="save-button"
              [disabled]="!selectedFile || uploading"
              (click)="uploadPhoto()"
            >
              {{
                uploading
                  ? 'Uploading...'
                  : 'Save Profile Photo'
              }}
            </button>

            <p *ngIf="successMessage" class="success-message">
              {{ successMessage }}
            </p>

            <p *ngIf="uploadError" class="error-message">
              {{ uploadError }}
            </p>

          </div>

          <div class="details">
            <h3>Account Information</h3>

            <div class="detail-row">
              <span>Name</span>
              <strong>{{ profile.name }}</strong>
            </div>

            <div class="detail-row">
              <span>Email</span>
              <strong>{{ profile.email }}</strong>
            </div>

            <div class="detail-row">
              <span>Account Type</span>
              <strong>{{ profile.role }}</strong>
            </div>
          </div>

        </ng-container>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 75vh;
      background: #f4f6fb;
    }

    .profile-page {
      padding: 35px 16px 60px;
    }

    .profile-card {
      max-width: 700px;
      margin: auto;
      padding: 30px;
      background: #fff;
      border: 1px solid #e4e7ec;
      border-radius: 18px;
      box-shadow: 0 8px 30px #1018280a;
    }

    .back-link {
      color: #2874f0;
      text-decoration: none;
      font-weight: 700;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    h1 {
      margin: 25px 0 5px;
      color: #101828;
      font-size: 32px;
      font-weight: 800;
    }

    .subtitle {
      color: #667085;
      margin-bottom: 15px;
    }

    .avatar-area {
      padding: 28px 0;
      text-align: center;
    }

    .avatar-wrapper {
      position: relative;
      width: 140px;
      height: 140px;
      margin: 0 auto 18px;
    }

    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 140px;
      height: 140px;
      margin: 0;
      border: 4px solid #eaf1ff;
      border-radius: 50%;
      object-fit: cover;
      box-sizing: border-box;
    }

    .avatar-placeholder {
      background: #2874f0;
      color: #fff;
      font-size: 48px;
      font-weight: 800;
    }

    .camera-button {
      position: absolute;
      right: 0;
      bottom: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      box-sizing: border-box;
      border: 3px solid #fff;
      border-radius: 50%;
      background: #2874f0;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      box-shadow: 0 3px 8px #0002;
      transition: background 0.2s;
    }

    .camera-button:hover {
      background: #1558c0;
    }

    .hidden-photo-input {
      display: none !important;
    }

    .avatar-area h2 {
      margin: 10px 0 4px;
      font-size: 24px;
      font-weight: 800;
      color: #101828;
    }

    .avatar-area > p {
      margin-top: 5px;
    }

    .avatar-area > p:not(.photo-hint):not(.success-message):not(.error-message) {
      color: #667085;
    }

    .photo-hint {
      color: #667085;
      font-size: 13px;
      margin: 8px 0 18px;
    }

    .save-button {
      width: 100%;
      max-width: 300px;
      padding: 13px 18px;
      color: #fff;
      background: #2874f0;
      border: 0;
      border-radius: 9px;
      font-weight: 750;
      cursor: pointer;
      transition: background 0.2s;
    }

    .save-button:hover:not(:disabled) {
      background: #1558c0;
    }

    .save-button:disabled {
      background: #98a2b3;
      cursor: not-allowed;
    }

    .details {
      margin-top: 15px;
      padding-top: 20px;
      border-top: 1px solid #eaecf0;
    }

    .details h3 {
      margin-bottom: 12px;
      font-size: 19px;
      color: #101828;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #eaecf0;
    }

    .detail-row span {
      color: #667085;
    }

    .detail-row strong {
      overflow-wrap: anywhere;
      text-align: right;
      color: #101828;
    }

    .message,
    .success-message,
    .error-message {
      padding: 12px;
      border-radius: 8px;
    }

    .message {
      background: #f2f4f7;
      color: #344054;
    }

    .success-message {
      color: #067647;
      background: #ecfdf3;
    }

    .error-message {
      color: #b42318;
      background: #fef3f2;
    }

    @media (max-width: 500px) {
      .profile-card {
        padding: 20px 15px;
      }

      h1 {
        font-size: 27px;
      }

      .detail-row {
        flex-direction: column;
        gap: 5px;
      }

      .detail-row strong {
        text-align: left;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {

  private readonly profileService = inject(ProfileService);

  profile: UserProfile | null = null;

  loading = true;
  uploading = false;

  errorMessage = '';
  uploadError = '';
  successMessage = '';

  selectedFile: File | null = null;
  photoPreview = '';
  photoUrl = '';

  private email = '';

  ngOnInit(): void {
    const stored = localStorage.getItem('shopkart-user');

    if (!stored) {
      this.loading = false;
      this.errorMessage = 'Please log in to view your profile.';
      return;
    }

    try {
      const user = JSON.parse(stored) as StoredUser;
      this.email = user.email || '';

      if (!this.email) {
        this.loading = false;
        this.errorMessage =
          'Your account email was not found. Please log in again.';
        return;
      }

      this.loadProfile();

    } catch {
      this.loading = false;
      this.errorMessage =
        'Could not read your account. Please log in again.';
    }
  }

  loadProfile(): void {
    this.profileService.getProfile(this.email).subscribe({
      next: profile => {
        this.profile = profile;

        this.photoUrl = this.profileService.getPhotoUrl(
          profile.profilePhotoUrl
        );

        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.errorMessage =
          error.error?.detail ||
          error.error?.message ||
          'Unable to load your profile. Please check the backend.';
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.uploadError = '';
    this.successMessage = '';

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.uploadError =
        'Please select a JPG, PNG or WebP image.';
      this.selectedFile = null;
      this.photoPreview = '';
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.uploadError = 'Photo size must be 5 MB or less.';
      this.selectedFile = null;
      this.photoPreview = '';
      input.value = '';
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.photoPreview = String(reader.result || '');
    };

    reader.onerror = () => {
      this.uploadError = 'Unable to preview this photo.';
      this.selectedFile = null;
      this.photoPreview = '';
    };

    reader.readAsDataURL(file);

    input.value = '';
  }

  uploadPhoto(): void {
    if (!this.selectedFile || !this.email || this.uploading) {
      return;
    }

    this.uploading = true;
    this.uploadError = '';
    this.successMessage = '';

    this.profileService.uploadPhoto(
      this.email,
      this.selectedFile
    ).subscribe({
      next: profile => {
        this.profile = profile;

        const uploadedUrl = this.profileService.getPhotoUrl(
          profile.profilePhotoUrl
        );

        this.photoUrl = uploadedUrl
          ? uploadedUrl + '?t=' + Date.now()
          : '';

        this.selectedFile = null;
        this.photoPreview = '';
        this.uploading = false;
        this.successMessage =
          'Profile photo updated successfully.';

        // Update the saved user data.
        const stored = localStorage.getItem('shopkart-user');

        if (stored) {
          try {
            const user = JSON.parse(stored) as StoredUser;

            user.profilePhotoUrl = profile.profilePhotoUrl;

            localStorage.setItem(
              'shopkart-user',
              JSON.stringify(user)
            );

            // Notify Navbar immediately.
            window.dispatchEvent(
              new Event('shopkart-profile-updated')
            );

          } catch {
            // The profile itself has already been saved by the backend.
          }
        }
      },
      error: error => {
        this.uploading = false;
        this.uploadError =
          error.error?.detail ||
          error.error?.message ||
          'Photo upload failed. Please try again.';
      }
    });
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.startsWith('data:')) {
      this.photoPreview = '';
    } else {
      this.photoUrl = '';
    }
  }
}