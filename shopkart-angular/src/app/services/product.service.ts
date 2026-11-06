
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://shopkart-3-fbca.onrender.com/api/products';

  private getAuthHeaders(): HttpHeaders {
    const savedUser = localStorage.getItem('shopkart-user');

    if (!savedUser) {
      throw new Error('Please login to continue.');
    }

    const user = JSON.parse(savedUser);
    const token = user?.token;

    if (!token) {
      throw new Error('JWT token missing. Please login again.');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(
      this.apiUrl,
      product,
      { headers: this.getAuthHeaders() }
    );
  }

  update(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(
      `${this.apiUrl}/${id}`,
      product,
      { headers: this.getAuthHeaders() }
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
