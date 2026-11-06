
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  template: `
    <div class="announcement-bar">
      <span>🔥 Mega Sale is Live!</span>
      <span>Free Delivery on Selected Products</span>
    </div>

    <header class="main-header">

      <div class="navbar-container">

        <a class="brand" routerLink="/">
          <span class="brand-name">ShopKart</span>
          <span class="brand-tagline">Shopping made easy</span>
        </a>

        <div class="nav-actions">

          <!-- PROFILE DROPDOWN -->
          <div class="profile-dropdown">

            <button
              class="profile-menu"
              type="button"
              (click)="toggleProfileDropdown()"
              [attr.aria-expanded]="profileDropdownOpen"
              aria-label="Open profile menu">

              <img
                *ngIf="profilePhotoUrl; else defaultAvatar"
                [src]="profilePhotoUrl"
                alt="Profile photo"
                class="profile-photo"
                (error)="onPhotoError()">

              <ng-template #defaultAvatar>
                <span class="profile-default">
                  <i class="bi bi-person-fill"></i>
                </span>
              </ng-template>

              <span class="profile-label">
                {{ currentUser ? currentUser.name : 'My Account' }}
              </span>

              <i
                class="bi"
                [ngClass]="profileDropdownOpen
                  ? 'bi-chevron-up'
                  : 'bi-chevron-down'">
              </i>

            </button>

            <div
              class="profile-dropdown-menu"
              *ngIf="profileDropdownOpen">

              <ng-container *ngIf="currentUser; else guestMenu">

                <div class="dropdown-user-info">
                  <strong>{{ currentUser.name }}</strong>
                  <small>{{ currentUser.email }}</small>
                </div>

                <div class="dropdown-divider"></div>

                <a
                  routerLink="/profile"
                  routerLinkActive="dropdown-selected"
                  (click)="closeProfileDropdown()">

                  <i class="bi bi-person-circle"></i>
                  My Profile
                </a>

                <a
                  routerLink="/orders"
                  routerLinkActive="dropdown-selected"
                  (click)="closeProfileDropdown()">

                  <i class="bi bi-box-seam"></i>
                  My Orders
                </a>

                <a
                  *ngIf="isAdmin"
                  routerLink="/admin/orders"
                  routerLinkActive="dropdown-selected"
                  (click)="closeProfileDropdown()">

                  <i class="bi bi-receipt"></i>
                  Admin Orders
                </a>

                <div class="dropdown-divider"></div>

                <button
                  type="button"
                  class="dropdown-logout"
                  (click)="logout()">

                  <i class="bi bi-box-arrow-right"></i>
                  Logout
                </button>

              </ng-container>

              <ng-template #guestMenu>

                <div class="dropdown-user-info">
                  <strong>Welcome to ShopKart!</strong>
                  <small>Login to access your account</small>
                </div>

                <div class="dropdown-divider"></div>

                <a
                  routerLink="/login"
                  (click)="closeProfileDropdown()">

                  <i class="bi bi-box-arrow-in-right"></i>
                  Login
                </a>

              </ng-template>

            </div>
          </div>

          <!-- CART -->
          <a
            class="cart-link"
            routerLink="/cart"
            routerLinkActive="selected">

            <i class="bi bi-cart3"></i>
            <span>Cart</span>
            <b>{{ cart.count }}</b>

          </a>

        </div>
      </div>

      <!-- CATEGORY NAVIGATION -->
      <nav class="category-strip">

        <a
          routerLink="/products"
          routerLinkActive="selected">
          All Products
        </a>

        <!-- MANAGE STORE DROPDOWN -->
        <div class="manage-store-dropdown" *ngIf="isAdmin">

          <button
            type="button"
            class="manage-store-btn"
            (click)="toggleManageStoreDropdown()"
            [attr.aria-expanded]="manageStoreDropdownOpen">

            <i class="bi bi-gear"></i>
            Manage Store

            <i
              class="bi"
              [ngClass]="manageStoreDropdownOpen
                ? 'bi-chevron-up'
                : 'bi-chevron-down'">
            </i>

          </button>

          <div
            class="manage-store-menu"
            *ngIf="manageStoreDropdownOpen">

            <!-- ADD PRODUCT -->
            <a
              routerLink="/admin/add-product"
              routerLinkActive="dropdown-selected"
              (click)="closeManageStoreDropdown()">

              <i class="bi bi-plus-circle"></i>
              Add Product

            </a>

            <!-- CREATE COUPON -->
            <a
              routerLink="/admin/create-coupon"
              routerLinkActive="dropdown-selected"
              (click)="closeManageStoreDropdown()">

              <i class="bi bi-ticket-perforated"></i>
              Create Coupon

            </a>

          </div>
        </div>

        <!-- ADMIN ANALYTICS -->
        <a
          *ngIf="isAdmin"
          routerLink="/admin/analytics"
          routerLinkActive="selected">

          <i class="bi bi-bar-chart-line"></i>
          Admin Analytics

        </a>

        <!-- ADMIN ORDERS -->
        <a
          *ngIf="isAdmin"
          routerLink="/admin/orders"
          routerLinkActive="selected">

          <i class="bi bi-receipt"></i>
          Admin Orders

        </a>

        <a
          routerLink="/products"
          [queryParams]="{category: 'Electronics'}">
          Electronics
        </a>

        <a
          routerLink="/products"
          [queryParams]="{category: 'Fashion'}">
          Fashion
        </a>

        <a
          routerLink="/products"
          [queryParams]="{category: 'Home'}">
          Home & Kitchen
        </a>

      </nav>

    </header>

    <!-- MAIN CONTENT -->
    <main class="page-content">
      <router-outlet></router-outlet>
    </main>

    <!-- FOOTER -->
    <footer class="main-footer">

      <div class="footer-content">

        <div>
          <h3>ShopKart</h3>
          <p>Your one-stop destination for online shopping.</p>
        </div>

        <div class="footer-links">

          <a routerLink="/">Home</a>
          <a routerLink="/products">Products</a>
          <a routerLink="/orders">Orders</a>
          <a routerLink="/profile">My Profile</a>

          <a
            *ngIf="isAdmin"
            routerLink="/admin/orders">
            Admin Orders
          </a>

        </div>

      </div>

      <div class="footer-bottom">
        © {{ year }} ShopKart. All rights reserved.
      </div>

    </footer>
  `,

  styles: [`

    :host {
      display: block;
      min-height: 100vh;
      color: #202124;
      font-family: Arial, Helvetica, sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    /* ANNOUNCEMENT BAR */

    .announcement-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 24px;
      padding: 8px 16px;
      background: #172337;
      color: #fff;
      font-size: 12px;
      text-align: center;
    }

    /* HEADER */

    .main-header {
      position: relative;
      z-index: 100;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .navbar-container {
      max-width: 1400px;
      min-height: 76px;
      margin: 0 auto;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .brand {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      text-decoration: none;
    }

    .brand-name {
      color: #2874f0;
      font-size: 27px;
      font-weight: 800;
      letter-spacing: -1px;
    }

    .brand-tagline {
      margin-top: 2px;
      color: #777;
      font-size: 11px;
    }

    /* NAV ACTIONS */

    .nav-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      flex-wrap: wrap;
    }

    /* PROFILE DROPDOWN */

    .profile-dropdown {
      position: relative;
    }

    .profile-menu {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 42px;
      padding: 5px 10px;
      border: none;
      border-radius: 7px;
      background: #fff;
      color: #333;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.2s ease;
      font-family: inherit;
    }

    .profile-menu:hover,
    .profile-menu:focus {
      background: #eef4ff;
      color: #2874f0;
    }

    .profile-photo,
    .profile-default {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .profile-photo {
      object-fit: cover;
      border: 1px solid #ddd;
    }

    .profile-default {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #eaf1ff;
      color: #2874f0;
      font-size: 21px;
    }

    .profile-label {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      font-weight: 600;
    }

    .profile-menu > i {
      font-size: 11px;
    }

    .profile-dropdown-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 230px;
      padding: 8px 0;
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 9px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.14);
      z-index: 200;
      animation: dropdownFade 0.18s ease;
    }

    @keyframes dropdownFade {
      from {
        opacity: 0;
        transform: translateY(-5px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-user-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 12px 16px;
    }

    .dropdown-user-info strong {
      color: #222;
      font-size: 14px;
      overflow-wrap: anywhere;
    }

    .dropdown-user-info small {
      color: #777;
      font-size: 11px;
      overflow-wrap: anywhere;
    }

    .dropdown-divider {
      height: 1px;
      margin: 6px 0;
      background: #eee;
    }

    .profile-dropdown-menu a,
    .dropdown-logout {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 11px 16px;
      border: none;
      background: #fff;
      color: #444;
      font-family: inherit;
      font-size: 13px;
      text-align: left;
      text-decoration: none;
      cursor: pointer;
      transition: 0.2s ease;
    }

    .profile-dropdown-menu a:hover,
    .dropdown-logout:hover {
      background: #f2f6ff;
      color: #2874f0;
    }

    .profile-dropdown-menu a i,
    .dropdown-logout i {
      width: 18px;
      font-size: 16px;
    }

    .profile-dropdown-menu a.dropdown-selected {
      background: #eef4ff;
      color: #2874f0;
    }

    .dropdown-logout {
      color: #dc3545;
    }

    .dropdown-logout:hover {
      background: #fff1f1;
      color: #c82333;
    }

    /* CART */

    .cart-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 42px;
      padding: 8px 12px;
      border-radius: 7px;
      background: #2874f0;
      color: #fff;
      text-decoration: none;
      white-space: nowrap;
      transition: background 0.2s ease;
    }

    .cart-link:hover,
    .cart-link.selected {
      background: #1558c0;
    }

    .cart-link i {
      font-size: 20px;
    }

    .cart-link span {
      font-size: 14px;
      font-weight: 600;
    }

    .cart-link b {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 21px;
      height: 21px;
      padding: 0 5px;
      border-radius: 50px;
      background: #fff;
      color: #2874f0;
      font-size: 12px;
    }

    /* CATEGORY NAVIGATION */

    .category-strip {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 30px;
      min-height: 45px;
      padding: 10px 20px;
      border-top: 1px solid #f0f0f0;
      overflow: visible;
    }

    .category-strip > a {
      color: #444;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      transition: color 0.2s ease;
    }

    .category-strip > a:hover,
    .category-strip > a.selected {
      color: #2874f0;
    }

    /* MANAGE STORE DROPDOWN */

    .manage-store-dropdown {
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    .manage-store-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 4px 0;
      border: none;
      background: transparent;
      color: #444;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: color 0.2s ease;
    }

    .manage-store-btn:hover,
    .manage-store-btn:focus {
      color: #2874f0;
    }

    .manage-store-btn i {
      font-size: 14px;
    }

    .manage-store-menu {
      position: absolute;
      top: calc(100% + 12px);
      left: 0;
      width: 195px;
      padding: 8px 0;
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 9px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.14);
      z-index: 300;
      animation: dropdownFade 0.18s ease;
    }

    .manage-store-menu a {
      display: flex;
      align-items: center;
      gap: 11px;
      width: 100%;
      padding: 12px 15px;
      color: #444;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      white-space: nowrap;
      transition: 0.2s ease;
    }

    .manage-store-menu a i {
      width: 18px;
      font-size: 16px;
    }

    .manage-store-menu a:hover,
    .manage-store-menu a.dropdown-selected {
      background: #f2f6ff;
      color: #2874f0;
    }

    /* PAGE CONTENT */

    .page-content {
      min-height: 60vh;
    }

    /* FOOTER */

    .main-footer {
      margin-top: 40px;
      padding: 30px 24px 15px;
      background: #172337;
      color: #fff;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      gap: 30px;
    }

    .footer-content h3 {
      margin: 0 0 10px;
      color: #fff;
      font-size: 22px;
    }

    .footer-content p {
      margin: 0;
      color: #c7cbd1;
      font-size: 13px;
    }

    .footer-links {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 18px;
    }

    .footer-links a {
      color: #e5e7eb;
      font-size: 13px;
      text-decoration: none;
    }

    .footer-links a:hover {
      color: #fff;
      text-decoration: underline;
    }

    .footer-bottom {
      max-width: 1200px;
      margin: 25px auto 0;
      padding-top: 15px;
      border-top: 1px solid #3a4657;
      color: #bfc5ce;
      font-size: 12px;
      text-align: center;
    }

    /* RESPONSIVE DESIGN */

    @media (max-width: 760px) {

      .navbar-container {
        align-items: flex-start;
        flex-direction: column;
        gap: 12px;
        padding: 14px 16px;
      }

      .nav-actions {
        width: 100%;
        justify-content: flex-start;
        gap: 8px;
      }

      .profile-menu {
        gap: 5px;
        padding: 5px 7px;
      }

      .profile-label {
        font-size: 12px;
      }

      .cart-link {
        gap: 5px;
        padding: 8px 9px;
      }

      .category-strip {
        justify-content: flex-start;
        gap: 20px;
        padding: 12px 16px;
      }

      .announcement-bar {
        gap: 8px;
        font-size: 11px;
      }

      .footer-content {
        flex-direction: column;
      }
    }

    @media (max-width: 420px) {

      .nav-actions {
        gap: 5px;
      }

      .profile-label {
        max-width: 105px;
        font-size: 11px;
      }

      .cart-link span {
        font-size: 12px;
      }

      .profile-dropdown-menu {
        right: auto;
        left: 0;
      }

      .category-strip {
        gap: 16px;
      }

      .manage-store-menu {
        left: 0;
      }
    }

  `]
})
export class AppComponent {

  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly year = new Date().getFullYear();

  profilePhotoUrl = '';

  profileDropdownOpen = false;
  manageStoreDropdownOpen = false;

  get currentUser() {
    return this.auth.currentUser;
  }

  // ADMIN CHECK
  get isAdmin(): boolean {
    const role = this.currentUser?.role?.toUpperCase();

    return role === 'ADMIN' || role === 'ROLE_ADMIN';
  }

  constructor() {
    this.loadProfilePhoto();
  }

  // PROFILE DROPDOWN

  toggleProfileDropdown(): void {
    this.profileDropdownOpen = !this.profileDropdownOpen;
    this.manageStoreDropdownOpen = false;
  }

  closeProfileDropdown(): void {
    this.profileDropdownOpen = false;
  }

  // MANAGE STORE DROPDOWN

  toggleManageStoreDropdown(): void {
    this.manageStoreDropdownOpen = !this.manageStoreDropdownOpen;
    this.profileDropdownOpen = false;
  }

  closeManageStoreDropdown(): void {
    this.manageStoreDropdownOpen = false;
  }

  // PROFILE PHOTO

  loadProfilePhoto(): void {
    try {
      const storedUser = localStorage.getItem('shopkart-user');

      if (!storedUser) {
        this.profilePhotoUrl = '';
        return;
      }

      const user = JSON.parse(storedUser);
      const photoUrl = user?.profilePhotoUrl;

      if (!photoUrl || typeof photoUrl !== 'string') {
        this.profilePhotoUrl = '';
        return;
      }

      this.profilePhotoUrl = photoUrl.startsWith('http')
        ? photoUrl
        : 'https://shopkart-3-fbca.onrender.com' +
          (photoUrl.startsWith('/') ? photoUrl : '/' + photoUrl);

    } catch (error) {
      console.error('Unable to load profile photo:', error);
      this.profilePhotoUrl = '';
    }
  }

  onPhotoError(): void {
    this.profilePhotoUrl = '';
  }

  // LOGOUT

  logout(): void {
    this.closeProfileDropdown();
    this.closeManageStoreDropdown();

    this.auth.logout();
    this.profilePhotoUrl = '';

    window.location.href = '/';
  }

}
