import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderTracking {
  id: number;
  status: string;
  description: string;
  updatedAt: string;
}

export interface StatusUpdateRequest {
  status: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderTrackingService {

  private readonly API_URL = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userData = localStorage.getItem('shopkart-user');

    let token = '';

    if (userData) {
      try {
        const user = JSON.parse(userData);
        token = user.token || '';
      } catch {
        token = '';
      }
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Get order tracking history
  getTrackingHistory(orderId: number): Observable<OrderTracking[]> {
    return this.http.get<OrderTracking[]>(
      `${this.API_URL}/${orderId}/tracking`,
      { headers: this.getHeaders() }
    );
  }

  // Update order status (Admin)
  updateOrderStatus(
    orderId: number,
    request: StatusUpdateRequest
  ): Observable<OrderTracking> {
    return this.http.patch<OrderTracking>(
      `${this.API_URL}/${orderId}/status`,
      request,
      { headers: this.getHeaders() }
    );
  }
}