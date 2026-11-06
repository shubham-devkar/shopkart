
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../../services/cart.service';
import {
  OrderService,
  PlaceOrderRequest,
  OrderItemRequest
} from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';
import {
  CouponService,
  CouponResponse
} from '../../services/coupon.service';

declare const Razorpay: any;

type PaymentMethod = 'COD' | 'RAZORPAY';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, RouterLink],
  template: `
    <div class="checkout-page container py-4">
      <nav class="breadcrumbs mb-4">
        <a routerLink="/">Home</a> /
        <a routerLink="/cart">Cart</a> /
        <span>Checkout</span>
      </nav>

      <h2 class="mb-4">Checkout</h2>

      <div *ngIf="cart.items.length === 0" class="empty-card">
        <h4>Your cart is empty</h4>
        <p>Please add products before checkout.</p>
        <a routerLink="/products" class="btn btn-primary">
          Continue Shopping
        </a>
      </div>

      <form
        *ngIf="cart.items.length > 0"
        #checkoutForm="ngForm"
        (ngSubmit)="submitOrder(checkoutForm)"
      >
        <div class="row g-4">
          <div class="col-lg-8">

            <section class="checkout-card">
              <h4>Customer Details</h4>

              <label for="customerName" class="form-label">
                Full Name *
              </label>
              <input
                id="customerName"
                class="form-control mb-3"
                name="customerName"
                [(ngModel)]="customer.name"
                required
                maxlength="100"
                autocomplete="name"
              />

              <div class="row">
                <div class="col-md-6">
                  <label for="email" class="form-label">Email *</label>
                  <input
                    id="email"
                    class="form-control mb-3"
                    type="email"
                    name="email"
                    [(ngModel)]="customer.email"
                    required
                    email
                    autocomplete="email"
                  />
                </div>

                <div class="col-md-6">
                  <label for="phone" class="form-label">
                    Mobile Number *
                  </label>
                  <input
                    id="phone"
                    class="form-control mb-3"
                    type="tel"
                    name="phone"
                    [(ngModel)]="customer.phone"
                    required
                    pattern="[0-9]{10}"
                    minlength="10"
                    maxlength="10"
                    autocomplete="tel"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>

              <h4 class="mt-3">Delivery Address</h4>

              <label for="address" class="form-label">
                House / Building / Street *
              </label>
              <textarea
                id="address"
                class="form-control mb-3"
                name="address"
                [(ngModel)]="customer.address"
                required
                minlength="5"
                maxlength="500"
                rows="3"
                autocomplete="street-address"
              ></textarea>

              <div class="row">
                <div class="col-md-6">
                  <label for="city" class="form-label">City *</label>
                  <input
                    id="city"
                    class="form-control mb-3"
                    name="city"
                    [(ngModel)]="customer.city"
                    required
                    autocomplete="address-level2"
                  />
                </div>

                <div class="col-md-6">
                  <label for="state" class="form-label">State *</label>
                  <input
                    id="state"
                    class="form-control mb-3"
                    name="state"
                    [(ngModel)]="customer.state"
                    required
                    autocomplete="address-level1"
                  />
                </div>
              </div>

              <label for="pincode" class="form-label">PIN Code *</label>
              <input
                id="pincode"
                class="form-control mb-3"
                name="pincode"
                [(ngModel)]="customer.pincode"
                required
                pattern="[0-9]{6}"
                minlength="6"
                maxlength="6"
                autocomplete="postal-code"
              />
            </section>

            <section class="checkout-card mt-4">
              <h4>Payment Method</h4>

              <label class="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  [(ngModel)]="paymentMethod"
                  value="COD"
                  required
                />
                <span>
                  <strong>Cash on Delivery</strong>
                  <small>Pay when the product is delivered.</small>
                </span>
              </label>

              <label class="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  [(ngModel)]="paymentMethod"
                  value="RAZORPAY"
                  required
                />
                <span>
                  <strong>Online Payment</strong>
                  <small>Razorpay Test Mode</small>
                </span>
              </label>
            </section>

            <div *ngIf="errorMessage" class="alert alert-danger mt-3">
              {{ errorMessage }}
            </div>

            <div *ngIf="message" class="alert alert-success mt-3">
              {{ message }}
            </div>
          </div>

          <div class="col-lg-4">
            <aside class="checkout-card order-summary">
              <h4>Order Summary</h4>

              <div
                class="summary-product"
                *ngFor="let item of cart.items"
              >
                <div>
                  <strong>{{ item.product.name }}</strong>
                  <div class="text-muted small">
                    Quantity: {{ item.quantity }}
                  </div>
                </div>

                <span>
                  {{
                    item.product.price * item.quantity
                      | currency:'INR':'symbol':'1.0-2'
                  }}
                </span>
              </div>

              <!-- Coupon Section -->
              <div class="coupon-section mt-4">
                <h5>Apply Coupon</h5>

                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    name="couponCode"
                    [(ngModel)]="couponCode"
                    placeholder="Enter coupon code"
                    [disabled]="!!appliedCoupon || isApplyingCoupon || isProcessing"
                  />

                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    (click)="applyCoupon()"
                    [disabled]="
                      isApplyingCoupon ||
                      !!appliedCoupon ||
                      isProcessing ||
                      !couponCode.trim()
                    "
                  >
                    {{ isApplyingCoupon ? 'Applying...' : 'Apply' }}
                  </button>
                </div>

                <div
                  *ngIf="appliedCoupon"
                  class="alert alert-success mt-2 mb-0"
                >
                  <strong>{{ appliedCoupon.code }}</strong>
                  applied successfully!

                  <button
                    type="button"
                    class="btn btn-sm btn-link text-danger"
                    (click)="removeCoupon()"
                    [disabled]="isProcessing"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div class="summary-line mt-3">
                <span>Subtotal</span>
                <strong>
                  {{ subtotal | currency:'INR':'symbol':'1.0-2' }}
                </strong>
              </div>

              <div class="summary-line mt-2">
                <span>Delivery</span>
                <strong class="text-success">FREE</strong>
              </div>

              <div
                class="summary-line mt-2"
                *ngIf="appliedCoupon"
              >
                <span class="text-success">Coupon Discount</span>
                <strong class="text-success">
                  - {{ discountAmount | currency:'INR':'symbol':'1.0-2' }}
                </strong>
              </div>

              <hr />

              <div class="summary-line total-line">
                <strong>Total Amount</strong>
                <strong>
                  {{ finalTotal | currency:'INR':'symbol':'1.0-2' }}
                </strong>
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100 mt-4"
                [disabled]="
                  isProcessing ||
                  isApplyingCoupon ||
                  !checkoutForm.valid
                "
              >
                {{
                  isProcessing
                    ? 'Please wait...'
                    : paymentMethod === 'COD'
                      ? 'Place Order (COD)'
                      : 'Pay Online'
                }}
              </button>

              <a
                routerLink="/cart"
                class="btn btn-outline-secondary w-100 mt-2"
              >
                Back to Cart
              </a>

              <p class="text-muted small mt-3 mb-0">
                Online payments require server-side verification.
              </p>
            </aside>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .checkout-page {
      max-width: 1200px;
      color: #202124;
    }

    .breadcrumbs a {
      color: #2874f0;
      text-decoration: none;
    }

    .checkout-card,
    .empty-card {
      background: #fff;
      border: 1px solid #e4e9f1;
      border-radius: 14px;
      padding: 24px;
      box-shadow: 0 3px 14px rgba(20, 40, 80, 0.04);
    }

    .checkout-card h4 {
      font-size: 20px;
      margin-bottom: 20px;
    }

    .form-control {
      padding: 11px 12px;
      border-radius: 8px;
    }

    .payment-option {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 15px;
      margin-bottom: 12px;
      border: 1px solid #e1e6ef;
      border-radius: 10px;
      cursor: pointer;
    }

    .payment-option input {
      margin-top: 5px;
    }

    .payment-option span {
      display: grid;
      gap: 4px;
    }

    .payment-option small {
      color: #687386;
    }

    .summary-product,
    .summary-line {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }

    .summary-product {
      padding: 12px 0;
      border-bottom: 1px solid #edf0f5;
    }

    .total-line {
      font-size: 18px;
    }

    .order-summary {
      position: sticky;
      top: 20px;
    }

    .coupon-section {
      padding: 15px;
      border: 1px dashed #cbd5e1;
      border-radius: 10px;
      background: #f8fafc;
    }

    .coupon-section h5 {
      font-size: 16px;
      margin-bottom: 12px;
    }

    .coupon-section .form-control {
      min-width: 0;
    }

    @media (max-width: 767px) {
      .checkout-card,
      .empty-card {
        padding: 18px;
      }

      .order-summary {
        position: static;
      }
    }
  `]
})
export class CheckoutComponent {
  readonly cart = inject(CartService);

  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly couponService = inject(CouponService);
  private readonly router = inject(Router);

  customer = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  };

  paymentMethod: PaymentMethod = 'COD';

  isProcessing = false;
  isApplyingCoupon = false;

  message = '';
  errorMessage = '';

  couponCode = '';
  appliedCoupon: CouponResponse | null = null;

  get subtotal(): number {
    return this.cart.total;
  }

  get discountAmount(): number {
    return this.appliedCoupon?.discountAmount ?? 0;
  }

  get finalTotal(): number {
    return this.appliedCoupon?.finalAmount ?? this.subtotal;
  }

  applyCoupon(): void {
    this.message = '';
    this.errorMessage = '';

    const code = this.couponCode.trim();

    if (!code) {
      this.errorMessage = 'Please enter a coupon code.';
      return;
    }

    if (this.subtotal <= 0) {
      this.errorMessage = 'Your cart is empty.';
      return;
    }

    if (this.isApplyingCoupon || this.isProcessing) {
      return;
    }

    this.isApplyingCoupon = true;

    this.couponService.applyCoupon({
      code,
      cartAmount: this.subtotal
    }).subscribe({
      next: response => {
        this.appliedCoupon = response;
        this.couponCode = response.code;
        this.message = response.message || 'Coupon applied successfully.';
        this.isApplyingCoupon = false;
      },
      error: error => {
        this.appliedCoupon = null;
        this.isApplyingCoupon = false;
        this.errorMessage =
          error?.error?.detail ||
          error?.error?.message ||
          'Invalid, expired, or ineligible coupon code.';
      }
    });
  }

  removeCoupon(): void {
    if (this.isProcessing) {
      return;
    }

    this.appliedCoupon = null;
    this.couponCode = '';
    this.message = 'Coupon removed successfully.';
    this.errorMessage = '';
  }

  submitOrder(form: NgForm): void {
    this.message = '';
    this.errorMessage = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.errorMessage =
        'Please fill in all required fields correctly.';
      return;
    }

    if (this.isProcessing || this.cart.items.length === 0) {
      this.errorMessage =
        'Your cart is empty or an order is already processing.';
      return;
    }

    if (this.isApplyingCoupon) {
      this.errorMessage = 'Please wait until coupon validation completes.';
      return;
    }

    let savedUser: string | null;

    try {
      savedUser = localStorage.getItem('shopkart-user');
    } catch {
      this.errorMessage = 'Unable to access your login session.';
      return;
    }

    if (!savedUser) {
      this.errorMessage = 'Please log in before placing your order.';
      this.router.navigate(['/login']);
      return;
    }

    let user: { email?: string };

    try {
      user = JSON.parse(savedUser) as { email?: string };
    } catch {
      this.errorMessage =
        'Your login session is invalid. Please log in again.';
      return;
    }

    if (!user.email) {
      this.errorMessage =
        'Login details are missing. Please log in again.';
      return;
    }

    if (
      !this.customer.email.trim() ||
      this.customer.email.trim().toLowerCase() !==
        user.email.trim().toLowerCase()
    ) {
      this.errorMessage =
        'Please enter the email address associated with your login.';
      return;
    }

    const items: OrderItemRequest[] = this.cart.items.flatMap(item => {
      const productId = item.product?.id;
      const quantity = Number(item.quantity);

      if (
        typeof productId !== 'number' ||
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return [];
      }

      return [{
        productId,
        quantity
      }];
    });

    if (items.length !== this.cart.items.length) {
      this.errorMessage =
        'A product in your cart has invalid details. Please remove it and add it again.';
      return;
    }

    const request: PlaceOrderRequest = {
      customerName: this.customer.name.trim(),
      customerEmail: this.customer.email.trim(),
      customerPhone: this.customer.phone.trim(),
      shippingAddress: this.customer.address.trim(),
      city: this.customer.city.trim(),
      state: this.customer.state.trim(),
      pincode: this.customer.pincode.trim(),
      paymentMethod: this.paymentMethod,
      couponCode: this.appliedCoupon?.code ?? '',
      items
    };

    this.isProcessing = true;

    if (this.paymentMethod === 'COD') {
      this.saveOrder(request);
      return;
    }

    this.paymentService.createOrder(this.finalTotal).subscribe({
      next: payment => this.openRazorpay(payment, request),
      error: error =>
        this.fail(error, 'Unable to start Razorpay payment.')
    });
  }

  private openRazorpay(
    payment: {
      keyId: string;
      orderId: string;
      amount: number;
      currency: string;
    },
    request: PlaceOrderRequest
  ): void {
    if (typeof Razorpay === 'undefined') {
      this.fail(
        null,
        'Razorpay script is missing. Add checkout.js in index.html.'
      );
      return;
    }

    const options = {
      key: payment.keyId,
      amount: payment.amount,
      currency: payment.currency,
      name: 'ShopKart',
      description: 'ShopKart order payment',
      order_id: payment.orderId,
      prefill: {
        name: this.customer.name,
        email: this.customer.email,
        contact: this.customer.phone
      },
      theme: {
        color: '#2874f0'
      },
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        this.paymentService.verifyPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature
        }).subscribe({
          next: result => {
            const verified =
              result === true ||
              (
                typeof result === 'object' &&
                result !== null &&
                result.verified === true
              );

            if (!verified) {
              this.fail(
                null,
                'Payment verification failed. The order is not confirmed.'
              );
              return;
            }

            this.saveOrder(request);
          },
          error: error => this.fail(
            error,
            'Payment verification failed. Check payment status before retrying.'
          )
        });
      },
      modal: {
        ondismiss: () => {
          if (this.isProcessing) {
            this.isProcessing = false;
            this.errorMessage =
              'Payment window closed. No order was submitted.';
          }
        }
      }
    };

    try {
      const razorpay = new Razorpay(options);

      razorpay.on('payment.failed', () => {
        this.fail(null, 'Payment failed. Please try again.');
      });

      razorpay.open();
    } catch {
      this.fail(null, 'Could not open Razorpay checkout.');
    }
  }

  private saveOrder(request: PlaceOrderRequest): void {
    this.orderService.placeOrder(request).subscribe({
      next: order => {
        this.cart.clear();
        this.isProcessing = false;
        this.message = `Order #${order.id} placed successfully.`;

        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 1200);
      },
      error: error => this.fail(
        error,
        'Order could not be saved. Check order/payment status before retrying.'
      )
    });
  }

  private fail(error: any, fallback: string): void {
    this.errorMessage =
      error?.error?.detail ||
      error?.error?.message ||
      error?.error?.error ||
      fallback;

    this.isProcessing = false;
  }
}
