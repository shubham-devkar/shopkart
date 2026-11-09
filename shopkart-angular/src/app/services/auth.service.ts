
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  token: string;
  id: number;
  name: string;
  email: string;
  role: string;
  message: string;
}

export interface ApiMessage {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  // Existing production API URL
  private api = 'https://shopkart-3-fbca.onrender.com/api/auth';

  get currentUser(): AuthUser | null {
    try {
      const storedUser = localStorage.getItem('shopkart-user');

      return storedUser
        ? JSON.parse(storedUser) as AuthUser
        : null;

    } catch {
      return null;
    }
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser?.token;
  }

  // STEP 1: Send registration OTP
  sendRegistrationOtp(
    name: string,
    email: string,
    password: string
  ): Observable<ApiMessage> {

    return this.http.post<ApiMessage>(
      `${this.api}/register/send-otp`,
      {
        name,
        email,
        password
      }
    );
  }

  // STEP 2: Verify OTP and create account
  verifyRegistrationOtp(
    email: string,
    otp: string
  ): Observable<AuthUser> {

    return this.http.post<AuthUser>(
      `${this.api}/register/verify-otp`,
      {
        email,
        otp
      }
    ).pipe(
      tap(user => this.save(user))
    );
  }

  // STEP 3: Resend OTP
  resendRegistrationOtp(
    email: string
  ): Observable<ApiMessage> {

    return this.http.post<ApiMessage>(
      `${this.api}/register/resend-otp`,
      {
        email
      }
    );
  }

  // EXISTING LOGIN API - unchanged
  login(
    email: string,
    password: string
  ): Observable<AuthUser> {

    return this.http.post<AuthUser>(
      `${this.api}/login`,
      {
        email,
        password
      }
    ).pipe(
      tap(user => this.save(user))
    );
  }

  logout(): void {
    localStorage.removeItem('shopkart-user');
  }

  private save(user: AuthUser): void {
    localStorage.setItem(
      'shopkart-user',
      JSON.stringify(user)
    );
  }
}
