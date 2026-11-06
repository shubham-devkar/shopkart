
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, RouterLink],
  template: `
    <main class="page">

      <!-- HERO -->
      <section class="hero">
        <p>WELCOME TO SHOPKART</p>
        <h1>Find your next favourite.</h1>
        <p>Explore mobiles, electronics and more.</p>
      </section>

      <!-- SEARCH AND FILTER -->
      <section class="toolbar">

        <input
          type="search"
          [(ngModel)]="searchText"
          placeholder="Search products..."
        />

        <select [(ngModel)]="selectedCategory">
          <option value="">All Categories</option>

          <option
            *ngFor="let category of categories"
            [value]="category"
          >
            {{ category }}
          </option>
        </select>

        <button
          class="secondary"
          type="button"
          (click)="resetFilters()"
        >
          Reset
        </button>

      </section>

      <!-- LOADING -->
      <p class="message" *ngIf="loading">
        Loading products...
      </p>

      <!-- ERROR -->
      <div class="error" *ngIf="errorMessage">
        {{ errorMessage }}

        <button
          class="primary"
          type="button"
          (click)="loadProducts()"
        >
          Retry
        </button>
      </div>

      <!-- SUCCESS -->
      <p class="message success" *ngIf="successMessage">
        {{ successMessage }}
      </p>

      <!-- PRODUCT HEADING -->
      <section class="heading">

        <div>
          <h2>Our Products</h2>
          <p>Discover products picked for you.</p>
        </div>

        <span>
          {{ filteredProducts.length }} products
        </span>

      </section>

      <!-- PRODUCT LIST -->
      <section
        class="product-grid"
        *ngIf="!loading && !errorMessage && filteredProducts.length"
      >

        <article
          class="product-card"
          *ngFor="let product of filteredProducts; trackBy: trackByProduct"
        >

          <!-- PRODUCT IMAGE -->
          <a
            class="image-wrap"
            [routerLink]="product.id != null ? ['/product', product.id] : ['/products']"
          >
            <img
              [src]="getProductImage(product)"
              [alt]="product.name"
              (error)="useFallbackImage($event)"
            />
          </a>

          <div class="product-info">

            <span class="category">
              {{ product.category }}
            </span>

            <!-- PRODUCT NAME -->
            <a
              class="product-name"
              [routerLink]="product.id != null ? ['/product', product.id] : ['/products']"
            >
              {{ product.name }}
            </a>

            <!-- DESCRIPTION -->
            <p class="description">
              {{ product.description || 'Explore this product on ShopKart.' }}
            </p>

            <!-- PRICE -->
            <div class="price">
              {{ product.price | currency:'INR':'symbol':'1.0-2':'en-IN' }}
            </div>

            <!-- STOCK -->
            <p
              class="stock"
              *ngIf="product.stockQuantity > 0"
            >
              In stock: {{ product.stockQuantity }}
            </p>

            <p
              class="out-stock"
              *ngIf="product.stockQuantity <= 0"
            >
              Out of stock
            </p>

            <!-- ADD TO CART -->
            <button
              class="primary full"
              type="button"
              (click)="addToCart(product)"
              [disabled]="product.id == null || product.stockQuantity <= 0"
            >
              Add to Cart
            </button>

            <!-- ADMIN ACTIONS -->
            <div class="actions admin-actions" *ngIf="isAdmin">

              <button
                class="secondary"
                type="button"
                (click)="editProduct(product)"
                [disabled]="product.id == null"
              >
                Edit
              </button>

              <button
                class="danger"
                type="button"
                (click)="deleteProduct(product)"
                [disabled]="product.id == null"
              >
                Delete
              </button>

            </div>

          </div>

        </article>

      </section>

      <!-- EMPTY PRODUCTS -->
      <p
        class="message"
        *ngIf="!loading && !errorMessage && filteredProducts.length === 0"
      >
        No products found. Try another search.
      </p>

    </main>
  `,

  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f5f7fb;
      color: #172033;
    }

    * {
      box-sizing: border-box;
    }

    .page {
      width: min(1200px, 94%);
      margin: auto;
      padding: 24px 0 48px;
    }

    /* HERO */

    .hero {
      padding: 38px;
      border-radius: 18px;
      color: white;
      background: linear-gradient(
        120deg,
        #172554,
        #2563eb,
        #38bdf8
      );
      margin-bottom: 24px;
    }

    .hero h1 {
      font-size: clamp(28px, 4vw, 44px);
      margin: 8px 0;
    }

    .hero p {
      margin-bottom: 8px;
    }

    /* TOOLBAR */

    .toolbar {
      display: flex;
      gap: 12px;
      margin-bottom: 28px;
    }

    input:not([type="checkbox"]),
    select {
      width: 100%;
      min-width: 0;
      padding: 12px;
      border: 1px solid #d8deea;
      border-radius: 9px;
      background: white;
      font: inherit;
    }

    .toolbar input {
      flex: 1;
    }

    /* BUTTONS */

    button {
      padding: 11px 15px;
      border: 0;
      border-radius: 8px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    button:disabled {
      opacity: .55;
      cursor: not-allowed;
    }

    .primary {
      background: #2563eb;
      color: white;
    }

    .secondary {
      background: #e8edf5;
      color: #172033;
    }

    .danger {
      background: #fee2e2;
      color: #b91c1c;
    }

    .full {
      width: 100%;
      margin-top: 12px;
    }

    /* HEADING */

    .heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin: 28px 0 18px;
    }

    .heading h2 {
      margin: 0 0 6px;
    }

    .heading p {
      color: #64748b;
      margin: 0;
    }

    .heading span {
      color: #64748b;
      font-size: 14px;
    }

    /* PRODUCT GRID */

    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 20px;
    }

    .product-card {
      min-width: 0;
      overflow: hidden;
      border: 1px solid #e4e9f2;
      border-radius: 14px;
      background: white;
      box-shadow: 0 4px 15px #0f172a0a;
    }

    .image-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 205px;
      padding: 14px;
      background: white;
    }

    .image-wrap img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* PRODUCT INFO */

    .product-info {
      padding: 16px;
    }

    .category {
      color: #2563eb;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .product-name {
      display: block;
      margin-top: 7px;
      color: #172033;
      font-size: 17px;
      font-weight: 750;
      text-decoration: none;
    }

    .product-name:hover {
      color: #2563eb;
    }

    .description {
      min-height: 39px;
      color: #64748b;
      font-size: 13px;
      line-height: 1.5;
    }

    .price {
      margin-top: 10px;
      font-size: 21px;
      font-weight: 800;
    }

    .stock,
    .out-stock {
      font-size: 12px;
    }

    .stock {
      color: #15803d;
    }

    .out-stock,
    .error {
      color: #b91c1c;
    }

    /* ADMIN ACTIONS */

    .actions {
      display: flex;
      gap: 8px;
      margin-top: 14px;
    }

    .admin-actions button {
      flex: 1;
    }

    /* MESSAGES */

    .message {
      padding: 24px;
      text-align: center;
      color: #64748b;
    }

    .success {
      color: #067647;
    }

    .error {
      padding: 16px;
      margin: 16px 0;
      border: 1px solid #fecdd3;
      border-radius: 10px;
      background: #fff1f2;
    }

    /* RESPONSIVE */

    @media (max-width: 1000px) {
      .product-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media (max-width: 700px) {
      .product-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .hero {
        padding: 24px;
      }

      .toolbar {
        flex-wrap: wrap;
      }

      .toolbar input,
      .toolbar select {
        flex-basis: 100%;
      }

      .image-wrap {
        height: 155px;
      }

      .product-info {
        padding: 12px;
      }
    }

    @media (max-width: 380px) {
      .product-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductsComponent implements OnInit {

  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  products: Product[] = [];
  categories: string[] = [];

  searchText = '';
  selectedCategory = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  readonly fallbackImage =
    'https://placehold.co/400x400/f2f5fa/52627a?text=ShopKart+Product';

  get isAdmin(): boolean {
    try {
      const savedUser = localStorage.getItem('shopkart-user');

      if (!savedUser) {
        return false;
      }

      const user = JSON.parse(savedUser);

      return String(user.role ?? '')
        .replace('ROLE_', '')
        .toUpperCase() === 'ADMIN';

    } catch {
      return false;
    }
  }

  get filteredProducts(): Product[] {
    const keyword = this.searchText.trim().toLowerCase();

    return this.products.filter(product => {

      const productName = (product.name ?? '').toLowerCase();
      const description = (product.description ?? '').toLowerCase();
      const productCategory = product.category ?? '';

      const matchesSearch =
        !keyword ||
        productName.includes(keyword) ||
        description.includes(keyword) ||
        productCategory.toLowerCase().includes(keyword);

      const matchesCategory =
        !this.selectedCategory ||
        this.normalizeCategory(productCategory) ===
          this.normalizeCategory(this.selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }

  ngOnInit(): void {

    this.route.queryParamMap.subscribe(params => {
      this.selectedCategory = params.get('category') ?? '';
    });

    this.loadProducts();
  }

  private normalizeCategory(
    category: string | null | undefined
  ): string {

    const value = (category ?? '').trim().toLowerCase();

    if (value.includes('electronic') || value === 'electonics') {
      return 'electronics';
    }

    if (value.includes('fashion')) {
      return 'fashion';
    }

    if (value.includes('home') || value.includes('kitchen')) {
      return 'home';
    }

    return value;
  }

  private displayCategory(category: string): string {

    const normalized = this.normalizeCategory(category);

    if (normalized === 'electronics') return 'Electronics';
    if (normalized === 'fashion') return 'Fashion';
    if (normalized === 'home') return 'Home & Kitchen';

    return category;
  }

  // LOAD PRODUCTS

  loadProducts(): void {

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.productService.getAll().subscribe({

      next: products => {

        this.products = (products ?? []).filter(
          product => product.active !== false
        );

        this.categories = [
          ...new Set(
            this.products
              .map(product => product.category?.trim())
              .filter((category): category is string => Boolean(category))
              .map(category => this.displayCategory(category))
          )
        ].sort((a, b) => a.localeCompare(b));

        this.loading = false;
      },

      error: error => {

        console.error('Products API failed:', error);

        this.errorMessage =
          error.status === 0
            ? 'Backend connect hot nahi. Spring Boot server check kara.'
            : error.status === 401 || error.status === 403
              ? 'Access denied. Login kiwa backend permissions check kara.'
              : 'Products load zale nahi. API ani backend console check kara.';

        this.loading = false;
      }
    });
  }

  // RESET FILTERS

  resetFilters(): void {

    this.searchText = '';
    this.selectedCategory = '';

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: null },
      queryParamsHandling: 'merge'
    });
  }

  // ADD TO CART

  addToCart(product: Product): void {

    if (product.id == null) {
      this.errorMessage = 'Product ID missing. Backend response check kara.';
      return;
    }

    if (product.stockQuantity <= 0) {
      this.errorMessage = 'Product is out of stock.';
      return;
    }

    this.cartService.addToCart(product);

    this.successMessage = `${product.name} added to cart.`;
  }

  // EDIT PRODUCT
  // Opens the separate Add Product page with the selected product ID.

  editProduct(product: Product): void {

    if (!this.isAdmin || product.id == null) {
      return;
    }

    this.router.navigate(['/admin/add-product'], {
      queryParams: { id: product.id }
    });
  }

  // DELETE PRODUCT

  deleteProduct(product: Product): void {

    if (!this.isAdmin || product.id == null) {
      this.errorMessage = 'Valid product ID and admin login are required.';
      return;
    }

    if (!confirm(`Delete "${product.name}"?`)) {
      return;
    }

    this.productService.delete(product.id).subscribe({

      next: () => {

        this.products = this.products.filter(
          item => item.id !== product.id
        );

        this.categories = [
          ...new Set(
            this.products
              .map(item => item.category?.trim())
              .filter((category): category is string => Boolean(category))
              .map(category => this.displayCategory(category))
          )
        ].sort((a, b) => a.localeCompare(b));

        this.successMessage = 'Product deleted successfully.';
      },

      error: error => {

        console.error('Delete product failed:', error);

        this.errorMessage =
          error.status === 403
            ? 'Admin permission missing.'
            : 'Product delete failed. Backend API check kara.';
      }
    });
  }

  // TRACK PRODUCT

  trackByProduct(
    _index: number,
    product: Product
  ): number | string {

    return product.id ?? product.name;
  }

  // IMAGE URL

  getImageUrl(path: string | null | undefined): string {

    if (!path?.trim()) {
      return this.fallbackImage;
    }

    const imagePath = path.trim();

    if (/^https?:\/\//i.test(imagePath)) {
      return imagePath;
    }

    if (imagePath.startsWith('/')) {
      return `http://localhost:8080${imagePath}`;
    }

    return `http://localhost:8080/${imagePath}`;
  }

  // PRODUCT IMAGE

  getProductImage(product: Product): string {

    return this.getImageUrl(product.imageUrl) === this.fallbackImage
      ? this.getFallbackImage(product)
      : this.getImageUrl(product.imageUrl);
  }

  // FALLBACK IMAGE BY CATEGORY

  private getFallbackImage(product: Product): string {

    const category = (product.category ?? '').toLowerCase();

    if (category.includes('mobile') || category.includes('phone')) {
      return 'https://placehold.co/400x400?text=Mobile';
    }

    if (category.includes('laptop') || category.includes('computer')) {
      return 'https://placehold.co/400x400?text=Laptop';
    }

    if (category.includes('headphone') || category.includes('audio')) {
      return 'https://placehold.co/400x400?text=Audio';
    }

    if (category.includes('fashion') || category.includes('shoe')) {
      return 'https://placehold.co/400x400?text=Fashion';
    }

    if (category.includes('watch')) {
      return 'https://placehold.co/400x400?text=Watch';
    }

    return this.fallbackImage;
  }

  // IMAGE ERROR

  useFallbackImage(event: Event): void {

    const image = event.target as HTMLImageElement;

    image.onerror = null;
    image.src = this.fallbackImage;
  }
}
