
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],

  template: `
    <section class="auth-wrap">

      <div class="auth-art">

        <span class="eyebrow">WELCOME TO SHOPKART</span>

        <h1>Your next favourite thing is waiting.</h1>

        <p>
          Discover great finds across mobiles, electronics,
          fashion and more.
        </p>

        <div class="auth-benefits">

          <div class="benefit">
            <i class="bi bi-truck"></i>
            <span>Easy shopping experience</span>
          </div>

          <div class="benefit">
            <i class="bi bi-shield-check"></i>
            <span>Secure account access</span>
          </div>

          <div class="benefit">
            <i class="bi bi-heart"></i>
            <span>Your favourites in one place</span>
          </div>

        </div>

        <div class="auth-art-icon">
          <i class="bi bi-bag-heart-fill"></i>
        </div>

      </div>

      <div class="auth-card">

        <div class="brand-mini">

          <span class="brand-icon">
            <i class="bi bi-bag-check-fill"></i>
          </span>

          <span>
            Shop<span class="brand-yellow">Kart</span>
          </span>

        </div>

        <div class="auth-tabs">

          <button
            type="button"
            [class.selected]="mode === 'login'"
            (click)="switchMode('login')">
            Login
          </button>

          <button
            type="button"
            [class.selected]="mode === 'register'"
            (click)="switchMode('register')">
            Create account
          </button>

        </div>

        <h2>
          {{
            mode === 'login'
              ? 'Welcome back!'
              : otpSent
                ? 'Verify your email'
                : 'Create your account'
          }}
        </h2>

        <p class="muted">
          {{
            mode === 'login'
              ? 'Sign in to continue shopping.'
              : otpSent
                ? 'Enter the 6-digit OTP sent to your email.'
                : 'Join ShopKart and discover great deals.'
          }}
        </p>

        <form (ngSubmit)="submit()" #authForm="ngForm">

          <!-- Full Name -->
          <ng-container *ngIf="mode === 'register' && !otpSent">

            <label for="fullName">
              Full name
            </label>

            <div class="input-wrap">

              <i class="bi bi-person"></i>

              <input
                id="fullName"
                type="text"
                name="name"
                [(ngModel)]="name"
                required
                minlength="2"
                maxlength="100"
                placeholder="Enter your full name"
                autocomplete="name">

            </div>

          </ng-container>

          <!-- Email -->
          <label for="email">
            Email address
          </label>

          <div class="input-wrap">

            <i class="bi bi-envelope"></i>

            <input
              id="email"
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              email
              [readonly]="otpSent"
              placeholder="you@example.com"
              autocomplete="email">

          </div>

          <!-- Password -->
          <ng-container *ngIf="!otpSent">

            <label for="password">
              Password
            </label>

            <div class="input-wrap">

              <i class="bi bi-lock"></i>

              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                name="password"
                [(ngModel)]="password"
                required
                minlength="6"
                maxlength="72"
                placeholder="At least 6 characters"
                [autocomplete]="mode === 'login'
                  ? 'current-password'
                  : 'new-password'">

              <button
                class="password-toggle"
                type="button"
                (click)="showPassword = !showPassword"
                [attr.aria-label]="showPassword
                  ? 'Hide password'
                  : 'Show password'">

                <i
                  [class]="showPassword
                    ? 'bi bi-eye-slash'
                    : 'bi bi-eye'">
                </i>

              </button>

            </div>

          </ng-container>

          <!-- OTP -->
          <ng-container *ngIf="mode === 'register' && otpSent">

            <label for="otp">
              Email Verification OTP
            </label>

            <div class="input-wrap">

              <i class="bi bi-shield-lock"></i>

              <input
                id="otp"
                type="text"
                name="otp"
                [(ngModel)]="otp"
                required
                minlength="6"
                maxlength="6"
                pattern="[0-9]{6}"
                inputmode="numeric"
                autocomplete="one-time-code"
                placeholder="Enter 6-digit OTP">

            </div>

            <button
              type="button"
              class="password-toggle"
              (click)="resendOtp()"
              [disabled]="busy">

              <i class="bi bi-arrow-clockwise"></i>
              Resend OTP

            </button>

          </ng-container>

          <!-- Submit -->
          <button
            class="submit-button"
            type="submit"
            [disabled]="busy || authForm.invalid">

            <span>
              {{
                busy
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Login to ShopKart'
                    : otpSent
                      ? 'Verify OTP & Create Account'
                      : 'Send Email OTP'
              }}
            </span>

            <i
              [class]="busy
                ? 'bi bi-arrow-repeat'
                : 'bi bi-arrow-right'">
            </i>

          </button>

        </form>

        <!-- Success Message -->
        <div
          class="status-message success"
          *ngIf="message">

          <i class="bi bi-check-circle-fill"></i>

          <span>{{ message }}</span>

        </div>

        <!-- Error Message -->
        <div
          class="status-message error"
          *ngIf="error">

          <i class="bi bi-exclamation-circle-fill"></i>

          <span>{{ error }}</span>

        </div>

        <!-- Footer -->
        <div class="auth-footer">

          <i class="bi bi-shield-lock"></i>

          Your account is protected by ShopKart.

        </div>

      </div>

    </section>
  `,

  styleUrl: './login.component.css'
})

export class LoginComponent {

  private auth = inject(AuthService);
  private router = inject(Router);

  mode: 'login' | 'register' = 'login';

  name = '';
  email = '';
  password = '';
  otp = '';

  otpSent = false;

  message = '';
  error = '';

  busy = false;
  showPassword = false;

  // Switch Login / Register
  switchMode(mode: 'login' | 'register'): void {

    this.mode = mode;

    this.message = '';
    this.error = '';

    this.showPassword = false;
    this.otpSent = false;

    this.otp = '';
  }

  // Main Submit
  submit(): void {

    if (this.busy) {
      return;
    }

    this.busy = true;

    this.error = '';
    this.message = '';

    // LOGIN
    if (this.mode === 'login') {

      this.auth.login(
        this.email.trim(),
        this.password
      ).subscribe({

        next: (response) => {

          this.message =
            response.message || 'Login successful!';

          this.busy = false;

          setTimeout(() => {
            this.router.navigateByUrl('/');
          }, 700);

        },

        error: (e) => {

          this.busy = false;

          this.error =
            e?.error?.message ||
            e?.error?.error ||
            (e?.status === 0
              ? 'Cannot connect to backend. Check the server.'
              : 'Invalid email or password.');

        }

      });

      return;
    }

    // REGISTER - SEND OTP
    if (!this.otpSent) {

      this.auth.sendRegistrationOtp(
        this.name.trim(),
        this.email.trim(),
        this.password
      ).subscribe({

        next: (response) => {

          this.busy = false;
          this.otpSent = true;

          this.message =
            response.message ||
            'OTP sent successfully to your email.';

        },

        error: (e) => {

          this.busy = false;

          this.error =
            e?.error?.message ||
            'Unable to send OTP. Please try again.';

        }

      });

      return;
    }

    // REGISTER - VERIFY OTP
    this.verifyOtp();
  }

  // Verify OTP
  verifyOtp(): void {

    if (!/^[0-9]{6}$/.test(this.otp)) {

      this.error = 'Please enter a valid 6-digit OTP.';
      return;

    }

    this.busy = true;

    this.error = '';
    this.message = '';

    this.auth.verifyRegistrationOtp(
      this.email.trim(),
      this.otp.trim()
    ).subscribe({

      next: (response) => {

        this.busy = false;

        this.message =
          response.message ||
          'Account created successfully!';

        setTimeout(() => {
          this.router.navigateByUrl('/');
        }, 700);

      },

      error: (e) => {

        this.busy = false;

        this.error =
          e?.error?.message ||
          'OTP verification failed. Please try again.';

      }

    });

  }

  // Resend OTP
  resendOtp(): void {

    if (this.busy) {
      return;
    }

    this.busy = true;

    this.error = '';
    this.message = '';

    this.auth.resendRegistrationOtp(
      this.email.trim()
    ).subscribe({

      next: (response) => {

        this.busy = false;
        this.otp = '';

        this.message =
          response.message ||
          'A new OTP has been sent to your email.';

      },

      error: (e) => {

        this.busy = false;

        this.error =
          e?.error?.message ||
          'Unable to resend OTP. Please try again.';

      }

    });

  }

}
