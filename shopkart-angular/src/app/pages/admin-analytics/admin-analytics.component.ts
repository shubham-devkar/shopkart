
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AnalyticsService,
  AnalyticsDashboard
} from '../../services/analytics.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-page">

      <div class="dashboard-header">
        <div>
          <h2>Analytics Dashboard</h2>
          <p>ShopKart store performance overview</p>
        </div>

        <button class="refresh-btn" (click)="loadDashboard()">
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      <div *ngIf="loading" class="message">
        Loading analytics...
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <ng-container *ngIf="dashboard as data">

        <!-- Summary Cards -->
        <div class="stats-grid">

          <div class="stat-card revenue">
            <div class="stat-icon"><i class="bi bi-currency-rupee"></i></div>
            <div>
              <p>Total Revenue</p>
              <h3>{{ data.totalRevenue | currency:'INR':'symbol':'1.0-0' }}</h3>
            </div>
          </div>

          <div class="stat-card orders">
            <div class="stat-icon"><i class="bi bi-bag-check"></i></div>
            <div>
              <p>Total Orders</p>
              <h3>{{ data.totalOrders }}</h3>
            </div>
          </div>

          <div class="stat-card products">
            <div class="stat-icon"><i class="bi bi-box-seam"></i></div>
            <div>
              <p>Total Products</p>
              <h3>{{ data.totalProducts }}</h3>
            </div>
          </div>

          <div class="stat-card customers">
            <div class="stat-icon"><i class="bi bi-people"></i></div>
            <div>
              <p>Total Customers</p>
              <h3>{{ data.totalCustomers }}</h3>
            </div>
          </div>

        </div>

        <!-- Charts -->
        <div class="content-grid">

          <section class="panel">
            <h3>Monthly Sales</h3>

            <div *ngIf="!data.monthlySales?.length" class="empty">
              No monthly sales data available.
            </div>

            <div class="sales-chart" *ngIf="data.monthlySales?.length">
              <div class="chart-column"
                   *ngFor="let item of data.monthlySales">

                <div class="bar-value">
                  {{ item.revenue | currency:'INR':'symbol':'1.0-0' }}
                </div>

                <div class="bar-area">
                  <div class="bar"
                       [style.height.%]="getBarHeight(item.revenue, data.monthlySales)">
                  </div>
                </div>

                <span class="month-label">
                  {{ item.month }}
                </span>

              </div>
            </div>
          </section>

          <section class="panel">
            <h3>Order Status</h3>

            <div *ngIf="!getStatusEntries(data.orderStatus).length"
                 class="empty">
              No order status data available.
            </div>

            <div class="status-list">
              <div class="status-row"
                   *ngFor="let status of getStatusEntries(data.orderStatus)">
                <span>{{ status[0] }}</span>
                <strong>{{ status[1] }}</strong>
              </div>
            </div>
          </section>

        </div>

        <!-- Inventory Summary -->
        <div class="inventory-grid">
          <div class="inventory-card warning">
            <i class="bi bi-exclamation-triangle"></i>
            <div>
              <p>Low Stock Products</p>
              <h3>{{ data.lowStockCount }}</h3>
            </div>
          </div>

          <div class="inventory-card danger">
            <i class="bi bi-x-circle"></i>
            <div>
              <p>Out of Stock Products</p>
              <h3>{{ data.outOfStockCount }}</h3>
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <section class="panel table-panel">
          <h3>Top Selling Products</h3>

          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>

              <tbody>
                <tr *ngFor="let product of data.topProducts">
                  <td>{{ product.productName }}</td>
                  <td>{{ product.quantity }}</td>
                  <td>{{ product.revenue | currency:'INR':'symbol':'1.0-0' }}</td>
                </tr>

                <tr *ngIf="!data.topProducts?.length">
                  <td colspan="3" class="empty">No product sales available.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Recent Orders -->
        <section class="panel table-panel">
          <h3>Recent Orders</h3>

          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                <tr *ngFor="let order of data.recentOrders">
                  <td>#{{ order.id }}</td>
                  <td>
                    {{ order.customerName }}
                    <small>{{ order.customerEmail }}</small>
                  </td>
                  <td>{{ order.totalAmount | currency:'INR':'symbol':'1.0-0' }}</td>
                  <td>
                    <span class="status-badge">{{ order.status }}</span>
                  </td>
                  <td>{{ order.createdAt | date:'dd MMM yyyy' }}</td>
                </tr>

                <tr *ngIf="!data.recentOrders?.length">
                  <td colspan="5" class="empty">No recent orders available.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Low Stock Products -->
        <section class="panel table-panel">
          <h3>Low Stock Products</h3>

          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Available Stock</th>
                </tr>
              </thead>

              <tbody>
                <tr *ngFor="let product of data.lowStockProducts">
                  <td>{{ product.name }}</td>
                  <td>{{ product.category }}</td>
                  <td>
                    <span class="stock-badge">
                      {{ product.stockQuantity }}
                    </span>
                  </td>
                </tr>

                <tr *ngIf="!data.lowStockProducts?.length">
                  <td colspan="3" class="empty">No low stock products.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </ng-container>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: #f5f7fb;
      min-height: 100vh;
    }

    .analytics-page {
      padding: 30px;
      max-width: 1500px;
      margin: auto;
      color: #202b3c;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      gap: 15px;
    }

    .dashboard-header h2 {
      font-size: 27px;
      font-weight: 750;
      margin: 0 0 6px;
    }

    .dashboard-header p,
    .stat-card p,
    .inventory-card p {
      color: #788397;
      margin: 0;
    }

    .refresh-btn {
      border: 0;
      border-radius: 8px;
      padding: 11px 18px;
      background: #2874f0;
      color: white;
      cursor: pointer;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
      margin-bottom: 22px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: white;
      padding: 22px;
      border-radius: 13px;
      box-shadow: 0 3px 15px #1c2b4a0c;
      min-width: 0;
    }

    .stat-icon {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .revenue .stat-icon { background: #e5f8ee; color: #16a05d; }
    .orders .stat-icon { background: #e8efff; color: #2874f0; }
    .products .stat-icon { background: #fff2df; color: #e99422; }
    .customers .stat-icon { background: #f2eaff; color: #8a54d6; }

    .stat-card h3,
    .inventory-card h3 {
      margin: 7px 0 0;
      font-size: 24px;
      font-weight: 750;
      overflow-wrap: anywhere;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 20px;
      margin-bottom: 22px;
    }

    .panel {
      background: white;
      border-radius: 13px;
      padding: 23px;
      margin-bottom: 22px;
      box-shadow: 0 3px 15px #1c2b4a0c;
      min-width: 0;
    }

    .panel h3 {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 22px;
    }

    .sales-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      gap: 12px;
      min-height: 230px;
      overflow-x: auto;
    }

    .chart-column {
      flex: 1;
      min-width: 48px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 220px;
    }

    .bar-value {
      font-size: 10px;
      color: #778397;
      height: 30px;
      white-space: nowrap;
    }

    .bar-area {
      height: 155px;
      width: 25px;
      display: flex;
      align-items: flex-end;
    }

    .bar {
      width: 100%;
      min-height: 3px;
      background: linear-gradient(180deg, #5798ff, #2874f0);
      border-radius: 6px 6px 0 0;
    }

    .month-label {
      font-size: 11px;
      color: #788397;
      margin-top: 10px;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      padding: 13px 2px;
      border-bottom: 1px solid #edf0f5;
      text-transform: capitalize;
    }

    .inventory-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-bottom: 22px;
    }

    .inventory-card {
      display: flex;
      align-items: center;
      gap: 18px;
      background: white;
      padding: 22px;
      border-radius: 13px;
    }

    .inventory-card > i {
      font-size: 28px;
    }

    .warning > i { color: #e69a22; }
    .danger > i { color: #dc4545; }

    .table-panel {
      overflow: hidden;
    }

    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 550px;
    }

    th, td {
      text-align: left;
      padding: 14px 12px;
      border-bottom: 1px solid #edf0f5;
      font-size: 13px;
    }

    th {
      color: #778397;
      background: #f8f9fc;
      font-weight: 650;
    }

    td small {
      display: block;
      color: #8791a2;
      margin-top: 4px;
    }

    .status-badge,
    .stock-badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 20px;
      background: #eaf1ff;
      color: #2874f0;
      font-size: 11px;
      font-weight: 650;
    }

    .stock-badge {
      background: #fff0e8;
      color: #d66a20;
    }

    .empty {
      color: #929bad;
      text-align: center;
      padding: 25px;
    }

    .message, .error-message {
      padding: 15px;
      margin-bottom: 18px;
      border-radius: 8px;
    }

    .message { background: #eaf1ff; color: #2874f0; }
    .error-message { background: #fff0f0; color: #c62828; }

    @media (max-width: 1000px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 700px) {
      .analytics-page { padding: 16px; }
      .content-grid { grid-template-columns: 1fr; }
      .inventory-grid { grid-template-columns: 1fr; }
      .dashboard-header h2 { font-size: 22px; }
      .stat-card { padding: 15px; }
      .stat-card h3 { font-size: 19px; }
    }

    @media (max-width: 420px) {
      .stats-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminAnalyticsComponent implements OnInit {

  private analyticsService = inject(AnalyticsService);

  dashboard: AnalyticsDashboard | null = null;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.analyticsService.getDashboard().subscribe({
      next: (response) => {
        this.dashboard = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Analytics API error:', error);
        this.errorMessage =
          error.status === 401 || error.status === 403
            ? 'Access denied. Please login using an ADMIN account.'
            : 'Unable to load analytics. Please check backend and API.';
        this.loading = false;
      }
    });
  }

  getBarHeight(value: number, sales: any[]): number {
    const maxValue = Math.max(
      ...sales.map(item => Number(item.revenue) || 0),
      1
    );

    return Math.max((Number(value) / maxValue) * 100, 2);
  }

  getStatusEntries(status: { [key: string]: number } | null | undefined) {
    return Object.entries(status || {});
  }
}
