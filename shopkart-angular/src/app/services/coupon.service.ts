
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type CouponType = 'PERCENTAGE' | 'FIXED';

export interface Coupon {
  id?: number;
  code: string;
  type: CouponType;
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount?: number | null;
  expiryDate: string;
  active: boolean;
}

export interface CouponApplyRequest {
  code: string;
  cartAmount: number;
}

export interface CouponResponse {
  code: string;
  cartAmount: number;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/coupons';

  // Admin: Get all coupons
  getAll(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.apiUrl);
  }

  // Admin: Create coupon
  create(coupon: Coupon): Observable<Coupon> {
    return this.http.post<Coupon>(this.apiUrl, coupon);
  }

  // Admin: Activate or deactivate coupon
  updateStatus(id: number, active: boolean): Observable<Coupon> {
    return this.http.patch<Coupon>(
      `${this.apiUrl}/${id}/status`,
      { active }
    );
  }

  // Customer: Apply coupon during checkout
  applyCoupon(request: CouponApplyRequest): Observable<CouponResponse> {
    return this.http.post<CouponResponse>(
      `${this.apiUrl}/apply`,
      request
    );
  }
}
