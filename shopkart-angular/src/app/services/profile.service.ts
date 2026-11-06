import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  profilePhotoUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/profile';
  private readonly serverUrl = 'http://localhost:8080';

  private readonly photoSubject = new BehaviorSubject<string>('');
  readonly photoUrl$ = this.photoSubject.asObservable();

  getProfile(email: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl, {
      params: { email }
    });
  }

  uploadPhoto(email: string, photo: File): Observable<UserProfile> {
    const formData = new FormData();
    formData.append('photo', photo);

    return this.http.post<UserProfile>(
      `${this.apiUrl}/photo`,
      formData,
      { params: { email } }
    );
  }

  getPhotoUrl(path: string | null | undefined): string {
    if (!path) return '';

    // Already a complete URL
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const normalizedPath = path.startsWith('/')
      ? path
      : `/${path}`;

    return `${this.serverUrl}${normalizedPath}`;
  }

  updatePhotoUrl(path: string | null | undefined): void {
    const url = this.getPhotoUrl(path);

    // Refresh image without browser cache
    const freshUrl = url
      ? `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`
      : '';

    this.photoSubject.next(freshUrl);
  }

  clearPhotoUrl(): void {
    this.photoSubject.next('');
  }
}