
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
          <span>Shop<span class="brand-yellow">Kart</span></span>
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
          {{ mode === 'login' ? 'Welcome back!' : 'Create your account' }}
        </h2>

        <p class="muted">
          {{
            mode === 'login'
              ? 'Sign in to continue shopping.'
              : 'Join ShopKart and discover great deals.'
          }}
        </p>

        <form (ngSubmit)="submit()" #authForm="ngForm">
          <label *ngIf="mode === 'register'" for="fullName">
            Full name
          </label>

          <div class="input-wrap" *ngIf="mode === 'register'">
            <i class="bi bi-person"></i>
            <input
              id="fullName"
              type="text"
              name="name"
              [(ngModel)]="name"
              required
              minlength="2"
              placeholder="Enter your full name"
              autocomplete="name">
          </div>

          <label for="email">Email address</label>
          <div class="input-wrap">
            <i class="bi bi-envelope"></i>
            <input
              id="email"
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              email
              placeholder="you@example.com"
              autocomplete="email">
          </div>

          <label for="password">Password</label>
          <div class="input-wrap">
            <i class="bi bi-lock"></i>
            <input
              id="password"
              [type]="showPassword ? 'text' : 'password'"
              name="password"
              [(ngModel)]="password"
              required
              minlength="6"
              placeholder="At least 6 characters"
              [autocomplete]="mode === 'login' ? 'current-password' : 'new-password'">

            <button
              class="password-toggle"
              type="button"
              (click)="showPassword = !showPassword"
              [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
              <i [class]="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>

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
                    : 'Create my account'
              }}
            </span>

            <i [class]="busy ? 'bi bi-arrow-repeat' : 'bi bi-arrow-right'"></i>
          </button>
        </form>

        <div class="status-message success" *ngIf="message">
          <i class="bi bi-check-circle-fill"></i>
          <span>{{ message }}</span>
        </div>

        <div class="status-message error" *ngIf="error">
          <i class="bi bi-exclamation-circle-fill"></i>
          <span>{{ error }}</span>
        </div>

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

  message = '';
  error = '';
  busy = false;
  showPassword = false;

  switchMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.message = '';
    this.error = '';
    this.showPassword = false;
  }

  submit(): void {
    if (this.busy) {
      return;
    }

    this.busy = true;
    this.error = '';
    this.message = '';

    const request =
      this.mode === 'login'
        ? this.auth.login(this.email.trim(), this.password)
        : this.auth.register(
            this.name.trim(),
            this.email.trim(),
            this.password
          );

    request.subscribe({
      next: (response: any) => {
        this.message = response?.message ||
          (this.mode === 'login'
            ? 'Login successful!'
            : 'Account created successfully!');

        this.busy = false;

        setTimeout(() => {
          this.router.navigateByUrl('/');
        }, 700);
      },
      error: (e: any) => {
        this.busy = false;

        this.error =
          e?.error?.message ||
          e?.error?.error ||
          (e?.status === 0
            ? 'Cannot connect to the backend. Check Spring Boot and MySQL.'
            : 'Login or registration failed. Please check your details and try again.');
      }
    });
  }
}
