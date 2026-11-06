
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Coupon, CouponService } from '../services/coupon.service';

@Component({
  selector: 'app-admin-create-coupon',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <main class="admin-page">

      <div class="page-heading">
        <div>
          <p class="eyebrow">SHOPKART ADMIN</p>
          <h1>Create Coupon</h1>
          <p>Create and manage discount offers for your customers.</p>
        </div>

        <a routerLink="/products" class="back-btn">
          <i class="bi bi-arrow-left"></i> Back to Products
        </a>
      </div>

      <section class="form-card">

        <h2>Coupon Details</h2>

        <p class="success" *ngIf="couponMessage">
          {{ couponMessage }}
        </p>

        <p class="error" *ngIf="couponError">
          {{ couponError }}
        </p>

        <form #couponForm="ngForm" (ngSubmit)="createCoupon()">

          <div class="form-grid">

            <div class="field">
              <label>Coupon Code *</label>
              <input
                name="couponCode"
                [(ngModel)]="form.code"
                placeholder="Example: SAVE10"
                required
              />
            </div>

            <div class="field">
              <label>Discount Type *</label>
              <select name="couponType" [(ngModel)]="form.type" required>
                <option value="PERCENTAGE">Percentage Discount (%)</option>
                <option value="FIXED">Fixed Discount (₹)</option>
              </select>
            </div>

            <div class="field">
              <label>Discount Value *</label>
              <input
                name="discountValue"
                type="number"
                [(ngModel)]="form.discountValue"
                placeholder="Discount value"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div class="field">
              <label>Minimum Order Amount (₹) *</label>
              <input
                name="minimumOrderAmount"
                type="number"
                [(ngModel)]="form.minimumOrderAmount"
                placeholder="Minimum order amount"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div class="field">
              <label>Maximum Discount (₹)</label>
              <input
                name="maximumDiscount"
                type="number"
                [(ngModel)]="form.maximumDiscount"
                placeholder="Optional maximum discount"
                min="0"
                step="0.01"
              />
            </div>

            <div class="field">
              <label>Expiry Date *</label>
              <input
                name="expiryDate"
                type="datetime-local"
                [(ngModel)]="form.expiryDate"
                required
              />
            </div>

          </div>

          <label class="active-label">
            <input
              type="checkbox"
              name="active"
              [(ngModel)]="form.active"
            />
            Active Coupon
          </label>

          <div class="form-actions">

            <button
              class="save-btn"
              type="submit"
              [disabled]="couponForm.invalid || saving"
            >
              <i class="bi bi-ticket-perforated"></i>
              {{ saving ? 'Creating...' : 'Create Coupon' }}
            </button>

            <button
              class="clear-btn"
              type="button"
              (click)="resetForm()"
            >
              Clear Form
            </button>

          </div>

        </form>
      </section>

      <!-- EXISTING COUPONS -->
      <section class="coupon-list">

        <div class="list-heading">
          <div>
            <h2>Available Coupons</h2>
            <p>View and manage your existing discount coupons.</p>
          </div>

          <button
            class="clear-btn"
            type="button"
            (click)="loadCoupons()"
            [disabled]="loading"
          >
            {{ loading ? 'Loading...' : 'Refresh Coupons' }}
          </button>
        </div>

        <p class="error" *ngIf="listError">{{ listError }}</p>

        <p class="empty" *ngIf="!loading && coupons.length === 0 && !listError">
          No coupons available.
        </p>

        <div class="coupon-card" *ngFor="let coupon of coupons">

          <div class="coupon-details">
            <strong>{{ coupon.code }}</strong>

            <p>
              <ng-container *ngIf="coupon.type === 'PERCENTAGE'">
                {{ coupon.discountValue }}% OFF
              </ng-container>

              <ng-container *ngIf="coupon.type === 'FIXED'">
                {{ coupon.discountValue | currency:'INR':'symbol':'1.0-2':'en-IN' }} OFF
              </ng-container>
            </p>

            <small>
              Minimum order:
              {{ coupon.minimumOrderAmount | currency:'INR':'symbol':'1.0-2':'en-IN' }}
            </small>

            <br />

            <small *ngIf="coupon.maximumDiscount != null">
              Maximum discount:
              {{ coupon.maximumDiscount | currency:'INR':'symbol':'1.0-2':'en-IN' }}
            </small>

            <br />

            <small>
              Expires: {{ coupon.expiryDate | date:'medium' }}
            </small>
          </div>

          <div class="coupon-actions">

            <span
              [class.active-status]="coupon.active"
              [class.inactive-status]="!coupon.active"
            >
              {{ coupon.active ? 'ACTIVE' : 'INACTIVE' }}
            </span>

            <button
              class="clear-btn"
              type="button"
              (click)="toggleCouponStatus(coupon)"
              [disabled]="coupon.id == null || updatingId === coupon.id"
            >
              {{
                updatingId === coupon.id
                  ? 'Updating...'
                  : coupon.active ? 'Deactivate' : 'Activate'
              }}
            </button>

          </div>
        </div>

      </section>

    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 70vh;
      background: #f5f7fb;
    }

    * {
      box-sizing: border-box;
    }

    .admin-page {
      width: min(1000px, 94%);
      margin: auto;
      padding: 35px 0 55px;
    }

    .page-heading,
    .list-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }

    .page-heading {
      margin-bottom: 25px;
    }

    .eyebrow {
      color: #2563eb;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    h1 {
      margin: 7px 0;
      color: #172033;
      font-size: 30px;
    }

    .page-heading p:last-child,
    .list-heading p {
      color: #64748b;
    }

    .back-btn {
      padding: 11px 16px;
      border-radius: 8px;
      background: #e8edf5;
      color: #172033;
      text-decoration: none;
      white-space: nowrap;
      font-weight: 600;
    }

    .form-card,
    .coupon-list {
      padding: 25px;
      border: 1px solid #e4e9f2;
      border-radius: 15px;
      background: white;
      box-shadow: 0 5px 20px #0f172a0a;
    }

    .form-card h2,
    .coupon-list h2 {
      margin-top: 0;
      color: #172033;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin: 20px 0;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field label {
      color: #334155;
      font-size: 14px;
      font-weight: 700;
    }

    .field input,
    .field select {
      width: 100%;
      padding: 12px;
      border: 1px solid #d8deea;
      border-radius: 8px;
      background: white;
      font: inherit;
    }

    .field input:focus,
    .field select:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px #2563eb18;
    }

    .active-label {
      display: flex;
      align-items: center;
      gap: 9px;
      color: #334155;
      font-weight: 600;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .save-btn,
    .clear-btn {
      padding: 12px 18px;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }

    .save-btn {
      background: #2563eb;
      color: white;
    }

    .clear-btn {
      background: #e8edf5;
      color: #172033;
    }

    button:disabled {
      opacity: .55;
      cursor: not-allowed;
    }

    .success {
      padding: 12px;
      border-radius: 8px;
      background: #dcfce7;
      color: #166534;
    }

    .error {
      padding: 12px;
      border-radius: 8px;
      background: #fee2e2;
      color: #b91c1c;
    }

    .coupon-list {
      margin-top: 25px;
    }

    .list-heading {
      margin-bottom: 20px;
    }

    .list-heading p {
      margin-bottom: 0;
    }

    .coupon-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
      padding: 17px;
      margin-top: 12px;
      border: 1px solid #e4e9f2;
      border-radius: 12px;
      background: #f8fafc;
    }

    .coupon-details strong {
      color: #172554;
      font-size: 18px;
    }

    .coupon-details p {
      margin: 6px 0;
      font-weight: 700;
    }

    .coupon-details small {
      color: #64748b;
    }

    .coupon-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .active-status {
      color: #15803d;
      font-size: 12px;
      font-weight: 800;
    }

    .inactive-status {
      color: #b91c1c;
      font-size: 12px;
      font-weight: 800;
    }

    .empty {
      padding: 20px;
      color: #64748b;
      text-align: center;
    }

    @media (max-width: 650px) {
      .page-heading,
      .list-heading,
      .coupon-card {
        align-items: flex-start;
        flex-direction: column;
      }

      .form-card,
      .coupon-list {
        padding: 18px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button,
      .list-heading button {
        width: 100%;
      }

      .coupon-actions {
        flex-wrap: wrap;
      }
    }
  `]
})
export class AdminCreateCouponComponent implements OnInit {

  private readonly couponService = inject(CouponService);

  coupons: Coupon[] = [];

  loading = false;
  saving = false;
  updatingId: number | null = null;

  couponMessage = '';
  couponError = '';
  listError = '';

  form: Coupon = this.emptyCoupon();

  ngOnInit(): void {
    this.loadCoupons();
  }

  private emptyCoupon(): Coupon {
    return {
      code: '',
      type: 'PERCENTAGE',
      discountValue: 10,
      minimumOrderAmount: 0,
      maximumDiscount: null,
      expiryDate: '',
      active: true
    };
  }

  loadCoupons(): void {
    this.loading = true;
    this.listError = '';

    this.couponService.getAll().subscribe({
      next: coupons => {
        this.coupons = coupons ?? [];
        this.loading = false;
      },
      error: error => {
        console.error('Load coupons failed:', error);
        this.listError = error.status === 403
          ? 'Admin permission missing.'
          : 'Coupons load failed. Check backend API.';
        this.loading = false;
      }
    });
  }

  createCoupon(): void {
    const code = this.form.code.trim().toUpperCase();
    const discount = Number(this.form.discountValue);
    const minimum = Number(this.form.minimumOrderAmount);

    if (!code || !Number.isFinite(discount) || discount <= 0) {
      this.couponError = 'Please enter valid coupon details.';
      return;
    }

    if (this.form.type === 'PERCENTAGE' && discount > 100) {
      this.couponError = 'Percentage discount cannot exceed 100%.';
      return;
    }

    if (!this.form.expiryDate) {
      this.couponError = 'Please select coupon expiry date.';
      return;
    }

    const expiryDate = new Date(this.form.expiryDate);

    if (Number.isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      this.couponError = 'Expiry date must be in the future.';
      return;
    }

    if (!Number.isFinite(minimum) || minimum < 0) {
      this.couponError = 'Minimum order amount must be zero or more.';
      return;
    }

    const maximumDiscount =
      this.form.maximumDiscount == null ||
      this.form.maximumDiscount === ('' as any)
        ? null
        : Number(this.form.maximumDiscount);

    if (
      maximumDiscount !== null &&
      (!Number.isFinite(maximumDiscount) || maximumDiscount < 0)
    ) {
      this.couponError = 'Maximum discount must be zero or more.';
      return;
    }

    const payload: Coupon = {
      ...this.form,
      code,
      discountValue: discount,
      minimumOrderAmount: minimum,
      maximumDiscount,
      expiryDate: this.form.expiryDate,
      active: this.form.active
    };

    this.saving = true;
    this.couponError = '';
    this.couponMessage = '';

    this.couponService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.couponMessage = 'Coupon created successfully.';
        this.resetForm();
        this.loadCoupons();
      },
      error: error => {
        console.error('Create coupon failed:', error);
        this.saving = false;
        this.couponError =
          error.error?.message ||
          (error.status === 403
            ? 'Admin permission missing.'
            : 'Coupon creation failed. Check backend API.');
      }
    });
  }

  toggleCouponStatus(coupon: Coupon): void {
    if (coupon.id == null) return;

    this.updatingId = coupon.id;
    this.couponError = '';
    this.couponMessage = '';

    this.couponService.updateStatus(coupon.id, !coupon.active)
      .subscribe({
        next: updatedCoupon => {
          this.coupons = this.coupons.map(item =>
            item.id === coupon.id ? updatedCoupon : item
          );

          this.updatingId = null;
          this.couponMessage = 'Coupon status updated successfully.';
        },
        error: error => {
          console.error('Coupon status update failed:', error);
          this.updatingId = null;
          this.couponError =
            error.error?.message || 'Coupon status update failed.';
        }
      });
  }

  resetForm(): void {
    this.form = this.emptyCoupon();
  }
}
