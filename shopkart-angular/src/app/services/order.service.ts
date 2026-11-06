
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface PlaceOrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  city?: string;
  couponCode?: string;
  state?: string;
  pincode?: string;
  paymentMethod?: 'COD' | 'RAZORPAY';
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: OrderItemResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/orders';

  /**
   * Read the login token and create authorization headers.
   */
  private getAuthHeaders(): HttpHeaders {
    let savedUser: string | null;

    try {
      savedUser = localStorage.getItem('shopkart-user');
    } catch {
      throw new Error('Unable to access login session.');
    }

    if (!savedUser) {
      throw new Error('Please login before placing an order.');
    }

    let user: { token?: string };

    try {
      user = JSON.parse(savedUser) as { token?: string };
    } catch {
      throw new Error('Invalid login session. Please login again.');
    }

    if (!user.token) {
      throw new Error(
        'Authentication token not found. Please login again.'
      );
    }

    return new HttpHeaders({
      Authorization: `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Place a new order through the backend API.
   */
  placeOrder(
    request: PlaceOrderRequest
  ): Observable<OrderResponse> {
    const headers = this.getAuthHeaders();

    return this.http.post<OrderResponse>(
      this.apiUrl,
      request,
      { headers }
    );
  }

  /**
   * Fetch order history for a customer.
   */
  getOrders(email: string): Observable<OrderResponse[]> {
    const headers = this.getAuthHeaders();

    const params = new HttpParams().set('email', email);

    return this.http.get<OrderResponse[]>(
      this.apiUrl,
      {
        headers,
        params
      }
    );
  }
}
