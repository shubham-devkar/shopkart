import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  ProductReview,
  ProductReviewRequest
} from '../models/product-review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'https://shopkart-3-fbca.onrender.com/api/reviews';

  getReviews(productId: number): Observable<ProductReview[]> {
    return this.http.get<ProductReview[]>(
      `${this.apiUrl}/product/${productId}`
    );
  }

  addReview(
    productId: number,
    request: ProductReviewRequest
  ): Observable<ProductReview> {

    const token = this.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<ProductReview>(
      `${this.apiUrl}/product/${productId}`,
      request,
      { headers }
    );
  }

  deleteReview(reviewId: number): Observable<{ message: string }> {

    const token = this.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${reviewId}`,
      { headers }
    );
  }

  private getToken(): string {
    const savedUser = localStorage.getItem('shopkart-user');

    if (!savedUser) {
      return '';
    }

    try {
      const user = JSON.parse(savedUser);
      return user?.token || '';
    } catch {
      return '';
    }
  }
}