
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private api = 'http://localhost:8080/api/auth';

  get currentUser(): AuthUser | null {
    try {
      const storedUser = localStorage.getItem('shopkart-user');
      return storedUser ? JSON.parse(storedUser) as AuthUser : null;
    } catch {
      return null;
    }
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser?.token;
  }

  register(
    name: string,
    email: string,
    password: string
  ): Observable<AuthUser> {
    return this.http.post<AuthUser>(
      `${this.api}/register`,
      { name, email, password }
    ).pipe(
      tap(user => this.save(user))
    );
  }

  login(
    email: string,
    password: string
  ): Observable<AuthUser> {
    return this.http.post<AuthUser>(
      `${this.api}/login`,
      { email, password }
    ).pipe(
      tap(user => this.save(user))
    );
  }

  logout(): void {
    localStorage.removeItem('shopkart-user');
  }

  private save(user: AuthUser): void {
    localStorage.setItem('shopkart-user', JSON.stringify(user));
  }
}
