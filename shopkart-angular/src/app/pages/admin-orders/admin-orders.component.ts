
import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface OrderItem {
  id?: number;
  productId?: number;
  productName?: string;
  name?: string;
  quantity: number;
  unitPrice?: number;
  price?: number;
  subtotal?: number;
}

interface ShopOrder {
  id: number;
  customerName?: string;
  customerEmail?: string;
  totalAmount?: number;
  totalPrice?: number;
  paymentMethod?: string;
  status?: string;
  createdAt?: string;
  orderDate?: string;
  items?: OrderItem[];

  // Dropdown मधील निवडलेला status
  selectedStatus?: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="container-fluid py-4">

      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold mb-1">Order Management</h2>
          <p class="text-muted mb-0">Manage and track customer orders</p>
        </div>

        <button class="btn btn-outline-primary" (click)="loadOrders()">
          Refresh Orders
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="row g-3 mb-4">

        <div class="col-md-4">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <p class="text-muted mb-1">Total Orders</p>
              <h3 class="fw-bold">{{ orders.length }}</h3>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <p class="text-muted mb-1">Pending Orders</p>
              <h3 class="fw-bold text-warning">{{ countStatus('PLACED') }}</h3>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <p class="text-muted mb-1">Delivered Orders</p>
              <h3 class="fw-bold text-success">{{ countStatus('DELIVERED') }}</h3>
            </div>
          </div>
        </div>

      </div>

      <!-- Messages -->
      <div *ngIf="loading" class="alert alert-info">
        Loading orders...
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <!-- Orders Table -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0 fw-bold">All Customer Orders</h5>
        </div>

        <div class="card-body p-0">
          <div class="table-responsive">

            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Order Date</th>
                  <th>Current Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>

              <tbody>
                <tr *ngFor="let order of orders">

                  <td class="fw-bold">#{{ order.id }}</td>

                  <td>
                    <div class="fw-semibold">
                      {{ order.customerName || 'Customer' }}
                    </div>
                    <small class="text-muted">
                      {{ order.customerEmail || '-' }}
                    </small>
                  </td>

                  <td>
                    <div *ngFor="let item of order.items">
                      {{ item.productName || item.name || ('Product #' + item.productId) }}
                      <small class="text-muted">
                        x {{ item.quantity }}
                      </small>
                    </div>
                    <span *ngIf="!order.items?.length">-</span>
                  </td>

                  <td class="fw-bold">
                    {{ order.totalAmount ?? order.totalPrice ?? 0 | currency:'INR' }}
                  </td>

                  <td>{{ order.paymentMethod || '-' }}</td>

                  <td>
                    {{ (order.createdAt || order.orderDate) ?
                        ((order.createdAt || order.orderDate) | date:'dd MMM yyyy') : '-' }}
                  </td>

                  <td>
                    <span class="badge"
                      [ngClass]="getStatusClass(order.status)">
                      {{ order.status || 'PLACED' }}
                    </span>
                  </td>

                  <td>
                    <div class="d-flex gap-2">
                      <select
                        class="form-select form-select-sm"
                        style="min-width: 155px"
                        [(ngModel)]="order.selectedStatus">

                        <option *ngFor="let status of statuses"
                          [value]="status">
                          {{ status }}
                        </option>
                      </select>

                      <button
                        class="btn btn-sm btn-primary"
                        [disabled]="!order.selectedStatus ||
                                    order.selectedStatus === order.status ||
                                    updatingOrderId === order.id"
                        (click)="updateStatus(order)">

                        {{ updatingOrderId === order.id ? 'Saving...' : 'Update' }}
                      </button>
                    </div>
                  </td>

                </tr>

                <tr *ngIf="!loading && orders.length === 0">
                  <td colspan="8" class="text-center py-5 text-muted">
                    No orders found.
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
      </div>

    </div>
  `
})
export class AdminOrdersComponent implements OnInit {

  private apiUrl = 'http://localhost:8080/api/orders';

  orders: ShopOrder[] = [];

  loading = false;
  updatingOrderId: number | null = null;

  errorMessage = '';
  successMessage = '';

  statuses: string[] = [
    'PLACED',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadOrders();
  }

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
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.get<any>(
      `${this.apiUrl}/admin/all`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response) => {
        const data = Array.isArray(response)
          ? response
          : response?.content || response?.orders || response?.data || [];

        this.orders = data.map((order: ShopOrder) => ({
          ...order,
          selectedStatus: order.status || 'PLACED'
        }));

        this.loading = false;
      },
      error: (error) => {
        console.error('Admin orders loading error:', error);
        this.errorMessage =
          error.status === 401 || error.status === 403
            ? 'You are not authorized to view all orders. Please login as admin.'
            : 'Orders could not be loaded. Please check the Admin Orders API endpoint.';
        this.loading = false;
      }
    });
  }

  updateStatus(order: ShopOrder): void {
    if (!order.selectedStatus || order.selectedStatus === order.status) {
      return;
    }

    this.updatingOrderId = order.id;
    this.errorMessage = '';
    this.successMessage = '';

    const request = {
      status: order.selectedStatus,
      description: `Order status updated to ${order.selectedStatus}`
    };

    this.http.patch(
      `${this.apiUrl}/${order.id}/status`,
      request,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        order.status = order.selectedStatus;
        this.successMessage = `Order #${order.id} status updated successfully.`;
        this.updatingOrderId = null;
      },
      error: (error) => {
        console.error('Status update error:', error);
        this.errorMessage =
          'Status update failed. Please check the API response.';
        order.selectedStatus = order.status || 'PLACED';
        this.updatingOrderId = null;
      }
    });
  }

  countStatus(status: string): number {
    return this.orders.filter(
      order => (order.status || 'PLACED') === status
    ).length;
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-danger';
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 'bg-info text-dark';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'bg-primary';
      default:
        return 'bg-warning text-dark';
    }
  }
}
