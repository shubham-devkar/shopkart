
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnalyticsDashboard {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
  outOfStockCount: number;

  orderStatus: { [status: string]: number };
  monthlySales: any[];
  topProducts: any[];
  recentOrders: any[];
  lowStockProducts: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private http = inject(HttpClient);

  private readonly API_URL =
    'http://localhost:8080/api/admin/analytics/dashboard';

  getDashboard(): Observable<AnalyticsDashboard> {

    const userData = localStorage.getItem('shopkart-user');

    let token = '';

    if (userData) {
      try {
        const user = JSON.parse(userData);
        token = user.token || '';
      } catch (error) {
        console.error('Unable to read logged-in user:', error);
      }
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<AnalyticsDashboard>(
      this.API_URL,
      { headers }
    );
  }
}
