
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { OrderService, OrderResponse } from '../services/order.service';
import {
  OrderTrackingService,
  OrderTracking
} from '../services/order-tracking.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="breadcrumbs">
      <a routerLink="/">Home</a>
      <i class="bi bi-chevron-right"></i>
      <span>My orders</span>
    </div>

    <section class="orders-page">
      <div class="section-heading">
        <div>
          <span class="eyebrow dark">YOUR SHOPPING ACTIVITY</span>
          <h2>My orders</h2>
          <p class="muted">Track your ShopKart purchases in one place.</p>
        </div>
      </div>

      <div *ngIf="loading" class="state-card">
        <p>Loading your orders...</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger mt-3">
        {{ errorMessage }}
      </div>

      <div
        *ngIf="!loading && !errorMessage && orders.length === 0"
        class="state-card">

        <i class="bi bi-box-seam empty-icon"></i>
        <h4>No orders yet</h4>
        <p>When you place an order, it will appear here.</p>

        <a routerLink="/products" class="btn add-button">
          Explore products
        </a>
      </div>

      <div *ngFor="let order of orders" class="order-card">

        <div class="order-header">
          <div>
            <h4>Order #{{ order.id }}</h4>
            <p class="muted">
              Placed on {{ order.createdAt | date:'medium' }}
            </p>
          </div>

          <span class="order-status">
            {{ order.status }}
          </span>
        </div>

        <div class="order-items">
          <div *ngFor="let item of order.items" class="order-item">
            <div>
              <strong>{{ item.productName }}</strong>
              <p class="muted">Quantity: {{ item.quantity }}</p>
            </div>

            <div class="item-price">
              {{ item.subtotal | currency:'INR':'symbol':'1.2-2' }}
            </div>
          </div>
        </div>

        <div class="order-footer">
          <span>Payment: {{ order.paymentMethod }}</span>

          <strong>
            Total: {{ order.totalAmount | currency:'INR':'symbol':'1.2-2' }}
          </strong>
        </div>

        <div class="tracking-action">
          <button
            type="button"
            class="track-button"
            (click)="trackOrder(order.id)">

            <i class="bi bi-truck"></i>
            {{ selectedOrderId === order.id ? 'Hide Tracking' : 'Track Order' }}
          </button>
        </div>

        <div
          *ngIf="selectedOrderId === order.id"
          class="tracking-panel">

          <h5>
            <i class="bi bi-geo-alt"></i>
            Order Tracking
          </h5>

          <div *ngIf="trackingLoading" class="tracking-message">
            Loading tracking history...
          </div>

          <div *ngIf="trackingError" class="alert alert-warning">
            {{ trackingError }}
          </div>

          <div
            *ngIf="!trackingLoading && !trackingError && trackingHistory.length === 0"
            class="tracking-message">

            Tracking history is not available yet.
          </div>

          <div
            *ngIf="!trackingLoading && trackingHistory.length > 0"
            class="timeline">

            <div
              *ngFor="let tracking of trackingHistory; let last = last"
              class="timeline-item"
              [class.last-item]="last">

              <div class="timeline-marker">
                <i class="bi bi-check-lg"></i>
              </div>

              <div class="timeline-content">
                <strong>{{ formatStatus(tracking.status) }}</strong>

                <p>{{ tracking.description }}</p>

                <small>
                  {{ tracking.updatedAt | date:'medium' }}
                </small>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .order-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      margin-top: 18px;
    }

    .order-header,
    .order-item,
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .order-header {
      padding-bottom: 14px;
      border-bottom: 1px solid #e5e7eb;
    }

    .order-header h4 {
      margin: 0 0 6px;
    }

    .muted {
      color: #6b7280;
      margin-bottom: 0;
    }

    .order-status {
      background: #e8f7ed;
      color: #18753a;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    .order-item {
      padding: 14px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .order-item:last-child {
      border-bottom: none;
    }

    .item-price {
      font-weight: 600;
      white-space: nowrap;
    }

    .order-footer {
      padding-top: 14px;
      border-top: 1px solid #e5e7eb;
      flex-wrap: wrap;
    }

    .tracking-action {
      margin-top: 18px;
    }

    .track-button {
      background: #2874f0;
      color: #fff;
      border: none;
      border-radius: 7px;
      padding: 10px 18px;
      font-weight: 600;
      cursor: pointer;
    }

    .track-button:hover {
      background: #1558c0;
    }

    .tracking-panel {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      margin-top: 18px;
      padding: 20px;
    }

    .tracking-panel h5 {
      margin-bottom: 22px;
      font-weight: 700;
    }

    .timeline {
      position: relative;
      margin-left: 8px;
    }

    .timeline-item {
      display: flex;
      gap: 15px;
      position: relative;
      padding-bottom: 25px;
    }

    .timeline-item:not(.last-item)::before {
      content: '';
      position: absolute;
      left: 13px;
      top: 28px;
      bottom: 0;
      width: 2px;
      background: #16a34a;
    }

    .timeline-marker {
      width: 28px;
      height: 28px;
      min-width: 28px;
      border-radius: 50%;
      background: #16a34a;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1;
    }

    .timeline-content strong {
      display: block;
      color: #166534;
      margin-bottom: 5px;
    }

    .timeline-content p {
      margin: 0 0 5px;
      color: #4b5563;
    }

    .timeline-content small {
      color: #6b7280;
    }

    .tracking-message {
      color: #6b7280;
      padding: 12px 0;
    }

    @media (max-width: 600px) {
      .order-card {
        padding: 14px;
      }

      .order-header,
      .order-item {
        align-items: flex-start;
      }

      .tracking-panel {
        padding: 14px;
      }
    }
  `]
})
export class OrdersComponent implements OnInit {

  private readonly orderService = inject(OrderService);

  private readonly trackingService = inject(OrderTrackingService);

  orders: OrderResponse[] = [];

  loading = true;
  errorMessage = '';

  selectedOrderId: number | null = null;

  trackingHistory: OrderTracking[] = [];
  trackingLoading = false;
  trackingError = '';

  ngOnInit(): void {

    const userText = localStorage.getItem('shopkart-user');

    if (!userText) {
      this.loading = false;
      this.errorMessage = 'Please login to view your orders.';
      return;
    }

    try {
      const user = JSON.parse(userText);
      const email = user?.email;

      if (!email) {
        this.loading = false;
        this.errorMessage =
          'Customer email was not found. Please login again.';
        return;
      }

      this.orderService.getOrders(email).subscribe({

        next: (result: OrderResponse[]) => {
          this.orders = result ?? [];
          this.loading = false;
          this.errorMessage = '';

          console.log('ORDERS LOADED:', this.orders);
        },

        error: (error: HttpErrorResponse) => {

          console.error('ORDERS API ERROR:', error);

          this.errorMessage =
            `Orders API Error: ${error.status} - ${error.statusText}`;

          this.loading = false;
        }
      });

    } catch (error: unknown) {

      console.error('Invalid signed-in customer data:', error);

      this.loading = false;
      this.errorMessage =
        'Login information is invalid. Please login again.';
    }
  }

  trackOrder(orderId: number): void {

    if (this.selectedOrderId === orderId) {
      this.selectedOrderId = null;
      return;
    }

    this.selectedOrderId = orderId;
    this.trackingHistory = [];
    this.trackingError = '';
    this.trackingLoading = true;

    this.trackingService.getTrackingHistory(orderId).subscribe({

      next: (result: OrderTracking[]) => {
        this.trackingHistory = result ?? [];
        this.trackingLoading = false;

        console.log('TRACKING HISTORY:', this.trackingHistory);
      },

      error: (error: HttpErrorResponse) => {

        console.error('TRACKING API ERROR:', error);

        this.trackingError =
          `Tracking API Error: ${error.status} - ${error.statusText}`;

        this.trackingLoading = false;
      }
    });
  }

  formatStatus(status: string): string {
    return (status || '')
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
