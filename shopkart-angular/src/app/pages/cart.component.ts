
import { Component, inject } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../services/cart.service';
import { CartItem } from '../models/product.model';

@Component({
  standalone: true,
  imports: [CurrencyPipe, NgFor, NgIf, RouterLink],
  template: `
    <div class="breadcrumbs">
      <a routerLink="/">Home</a>
      <i class="bi bi-chevron-right"></i>
      <span>Your cart</span>
    </div>

    <section class="cart-page">
      <div class="section-heading">
        <div>
          <span class="eyebrow dark">READY WHEN YOU ARE</span>
          <h2>Your shopping cart</h2>
        </div>
      </div>

      <div
        *ngIf="cart.items.length === 0"
        class="state-card cart-empty">

        <i class="bi bi-cart-x empty-icon"></i>
        <h4>Your cart is empty</h4>
        <p>Explore the store and add something you love.</p>

        <a routerLink="/" class="btn add-button">
          Continue shopping
        </a>
      </div>

      <div
        class="cart-layout"
        *ngIf="cart.items.length > 0">

        <div class="cart-items">
          <article
            class="cart-item"
            *ngFor="let item of cart.items">

            <img
              [src]="item.product.imageUrl || fallbackImage"
              [alt]="item.product.name"
              (error)="onImageError($event)"
            >

            <div class="cart-item-main">
              <span class="product-category">
                {{ item.product.category }}
              </span>

              <h5>{{ item.product.name }}</h5>

              <strong>
                {{
                  item.product.price
                    | currency:'INR':'symbol':'1.0-2'
                }}
              </strong>

              <div class="quantity-control">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  (click)="change(item, item.quantity - 1)"
                  [disabled]="item.quantity <= 1">
                  −
                </button>

                <span>{{ item.quantity }}</span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  (click)="change(item, item.quantity + 1)"
                  [disabled]="
                    item.quantity >= item.product.stockQuantity
                  ">
                  +
                </button>
              </div>
            </div>

            <div class="cart-item-end">
              <strong>
                {{
                  item.product.price * item.quantity
                    | currency:'INR':'symbol':'1.0-2'
                }}
              </strong>

              <button
                type="button"
                class="remove-button"
                (click)="removeItem(item)">
                <i class="bi bi-trash3"></i>
                Remove
              </button>
            </div>
          </article>
        </div>

        <aside class="summary-card">
          <h4>Price details</h4>

          <div class="summary-line">
            <span>Items ({{ cart.count }})</span>
            <span>
              {{ cart.total | currency:'INR':'symbol':'1.0-2' }}
            </span>
          </div>

          <div class="summary-line">
            <span>Delivery</span>
            <span class="free-label">FREE</span>
          </div>

          <hr>

          <div class="summary-line total-line">
            <span>Total amount</span>
            <strong>
              {{ cart.total | currency:'INR':'symbol':'1.0-2' }}
            </strong>
          </div>

          <button
            type="button"
            class="btn add-button w-100 mt-3"
            (click)="goToCheckout()"
            [disabled]="cart.items.length === 0">
            <i class="bi bi-lock-fill me-1"></i>
            Proceed to Checkout
          </button>

          <p class="small text-muted mt-2 mb-0">
            Review your order and select your payment method
            on the checkout page.
          </p>

          <a routerLink="/" class="continue-link">
            Continue shopping
          </a>
        </aside>
      </div>

      <div class="alert alert-success mt-3" *ngIf="message">
        {{ message }}
      </div>

      <div class="alert alert-danger mt-3" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>
    </section>
  `
})
export class CartComponent {
  readonly cart = inject(CartService);
  private readonly router = inject(Router);

  readonly fallbackImage =
    'https://placehold.co/300x240/f2f5fa/52627a?text=Product';

  message = '';
  errorMessage = '';

  change(item: CartItem, quantity: number): void {
    this.message = '';
    this.errorMessage = '';

    if (item.product.id != null) {
      this.cart.changeQuantity(item.product.id, quantity);
    }
  }

  removeItem(item: CartItem): void {
    this.message = '';
    this.errorMessage = '';

    if (item.product.id != null) {
      this.cart.remove(item.product.id);
      this.message = 'Product removed from cart.';
    }
  }

  goToCheckout(): void {
    this.message = '';
    this.errorMessage = '';

    if (this.cart.items.length === 0) {
      this.errorMessage = 'Your cart is empty.';
      return;
    }

    this.router.navigate(['/checkout']);
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = this.fallbackImage;
  }
}
