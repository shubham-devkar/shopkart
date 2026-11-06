
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/payment';

export interface CreatePaymentResponse {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const savedUser = localStorage.getItem('shopkart-user');

    if (!savedUser) {
      throw new Error('Please log in before making a payment.');
    }

    let user: { token?: string };

    try {
      user = JSON.parse(savedUser) as { token?: string };
    } catch {
      throw new Error('Invalid login session. Please log in again.');
    }

    if (!user.token) {
      throw new Error('Authentication token is missing. Please log in again.');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    });
  }

  createOrder(amount: number): Observable<CreatePaymentResponse> {
    return this.http.post<CreatePaymentResponse>(
      `${API_URL}/create-order`,
      { amount },
      { headers: this.getHeaders() }
    );
  }

  verifyPayment(
    request: VerifyPaymentRequest
  ): Observable<boolean | VerifyPaymentResponse> {
    return this.http.post<boolean | VerifyPaymentResponse>(
      `${API_URL}/verify`,
      request,
      { headers: this.getHeaders() }
    );
  }
}
