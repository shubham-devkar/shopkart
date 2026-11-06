import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';

@Component({
  standalone: true,
  imports: [CurrencyPipe, NgClass, NgFor, NgIf, FormsModule, RouterLink],
  template: `
    <section class="promo-ribbon">
      <span><i class="bi bi-truck"></i> Free delivery on selected products</span>
      <span><i class="bi bi-shield-check"></i> Safe & easy shopping</span>
      <span><i class="bi bi-arrow-repeat"></i> Simple returns</span>
    </section>

    <section class="hero hero-premium">
      <div class="hero-copy">
        <span class="eyebrow"><i class="bi bi-stars"></i> THE BIG SHOPKART SALE</span>
        <h1>Good finds.<br><span>Great prices.</span></h1>
        <p>Discover everyday essentials, trending tech and little things that make life better.</p>
        <a class="btn hero-btn" href="#products">Shop the collection <i class="bi bi-arrow-right"></i></a>
        <div class="hero-proof"><span><i class="bi bi-check-circle-fill"></i> Curated picks</span><span><i class="bi bi-lightning-charge-fill"></i> Fresh deals</span></div>
      </div>
      <div class="hero-visual" aria-label="Shopping collection">
        <div class="hero-image-main"><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=85" alt="" (error)="onHeroImageError($event)"></div>
        <div class="hero-image-product hero-phone"><img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=85" alt="Smartphone" (error)="onHeroImageError($event)"></div>
        <div class="hero-image-product hero-sneaker"><img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=85" alt="Red sneaker" (error)="onHeroImageError($event)"></div>
        <div class="deal-float"><small>WEEKLY DEALS</small><strong>Up to 40% off</strong><span>Find your next favourite</span></div>
      </div>
      <div class="hero-decoration decor-one"></div><div class="hero-decoration decor-two"></div>
    </section>

    <section class="category-section">
      <div class="mini-section-heading"><div><span class="eyebrow dark">EXPLORE SHOPKART</span><h2>Shop by category</h2></div><span class="muted-note">Something for every day</span></div>
      <div class="category-strip category-tiles">
        <button class="category-tile" [class.selected]="selectedCategory === ''" (click)="chooseCategory('')"><span class="category-icon all-icon"><i class="bi bi-grid-fill"></i></span><strong>All products</strong><small>Explore everything</small></button>
        <button class="category-tile" *ngFor="let category of categories" [class.selected]="selectedCategory === category" (click)="chooseCategory(category)"><span class="category-icon" [ngClass]="categoryClass(category)"><i class="bi" [ngClass]="categoryIcon(category)"></i></span><strong>{{ category }}</strong><small>Shop collection</small></button>
      </div>
    </section>

    <section class="deal-banner">
      <div><span class="deal-kicker"><i class="bi bi-lightning-fill"></i> DEALS THAT FEEL GOOD</span><h2>Upgrade your everyday.</h2><p>Find smart picks for work, home and play.</p></div>
      <a href="#products" class="deal-link">Explore deals <i class="bi bi-arrow-up-right"></i></a>
      <div class="deal-art"><i class="bi bi-bag-heart-fill"></i></div>
    </section>

    <section id="products" class="products-section">
      <div class="section-heading">
        <div><span class="eyebrow dark">PICKED FOR YOU</span><h2>{{ selectedCategory || 'Popular products' }}</h2><p class="section-subtitle">Great products to make your day a little better.</p></div>
        <div class="search-box"><i class="bi bi-search"></i><input [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Search products, brands..." aria-label="Search products"><button *ngIf="searchTerm" class="clear-search" (click)="searchTerm='';applyFilters()" aria-label="Clear search"><i class="bi bi-x-lg"></i></button></div>
      </div>
      <div class="results-meta" *ngIf="!loading && !errorMessage"><span>{{ filteredProducts.length }} products to explore</span><span><i class="bi bi-patch-check-fill"></i> ShopKart picks</span></div>
      <div *ngIf="loading" class="state-card"><span class="spinner-border spinner-border-sm me-2"></span> Finding great products for you...</div>
      <div *ngIf="errorMessage" class="alert alert-warning">{{ errorMessage }} <button class="btn btn-sm btn-outline-dark ms-2" (click)="loadProducts()">Try again</button></div>
      <div *ngIf="!loading && !errorMessage && filteredProducts.length === 0" class="state-card"><i class="bi bi-box-seam empty-icon"></i><h5>No products found</h5><p>Try another search or add products in Manage Products.</p><button class="btn btn-primary" (click)="searchTerm='';chooseCategory('')">Show all products</button></div>
      <div class="product-grid" *ngIf="!loading && filteredProducts.length">
        <article class="product-card" *ngFor="let product of filteredProducts">
          <a class="product-image" [routerLink]="['/product', product.id]">
            <img [src]="getProductImage(product)" [alt]="product.name" loading="lazy" (error)="onImageError($event)">
            <span class="image-label"><i class="bi bi-stars"></i> ShopKart pick</span>
            <span class="image-wishlist" aria-label="Favourite"><i class="bi bi-heart"></i></span>
          </a>
          <div class="product-info">
            <span class="product-category">{{ product.category || 'Everyday essentials' }}</span>
            <a class="product-name" [routerLink]="['/product', product.id]">{{ product.name }}</a>
            <p class="product-description">{{ product.description || 'A great pick for your everyday needs.' }}</p>
            <div class="product-rating"><span>★ ★ ★ ★ ☆</span><small>Popular choice</small></div>
            <div class="price-row"><strong>{{ product.price | currency:'INR':'symbol':'1.0-2' }}</strong><span class="stock" [class.out]="product.stockQuantity < 1">{{ product.stockQuantity > 0 ? 'In stock' : 'Out of stock' }}</span></div>
            <button class="btn add-button" [disabled]="product.stockQuantity < 1" (click)="addToCart(product)"><i class="bi bi-bag-plus me-2"></i>Add to cart</button>
          </div>
        </article>
      </div>
    </section>
    <section class="service-promises">
      <div><span><i class="bi bi-truck"></i></span><div><strong>Convenient delivery</strong><small>Shopping made simple</small></div></div>
      <div><span><i class="bi bi-shield-check"></i></span><div><strong>Easy, safe shopping</strong><small>A smooth shopping experience</small></div></div>
      <div><span><i class="bi bi-headset"></i></span><div><strong>Here to help</strong><small>Support when you need it</small></div></div>
    </section>
    <div class="toast-note" *ngIf="notice"><i class="bi bi-check-circle-fill"></i> {{ notice }}</div>
  `
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  selectedCategory = '';
  searchTerm = '';
  loading = true;
  errorMessage = '';
  notice = '';
  readonly fallbackImage = 'https://placehold.co/600x450/f2f5fa/52627a?text=ShopKart+Product';

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.productService.getAll().subscribe({
      next: products => {
        this.products = products.filter(p => p.active !== false);
        this.categories = [...new Set(this.products.map(p => p.category).filter(Boolean))].sort();
        this.applyFilters();
        this.loading = false;
      },
      error: error => { this.loading = false; this.errorMessage = error.message || 'Unable to load products.'; }
    });
  }

  chooseCategory(category: string): void { this.selectedCategory = category; this.applyFilters(); }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = !this.selectedCategory || (product.category || '').toLowerCase() === this.selectedCategory.toLowerCase();
      const matchesTerm = !term || product.name.toLowerCase().includes(term) || (product.category || '').toLowerCase().includes(term) || (product.description || '').toLowerCase().includes(term);
      return matchesCategory && matchesTerm;
    });
  }

  categoryIcon(category: string): string {
    const c = category.toLowerCase();
    if (c.includes('mobile') || c.includes('phone')) return 'bi-phone';
    if (c.includes('laptop') || c.includes('computer')) return 'bi-laptop';
    if (c.includes('fashion') || c.includes('cloth')) return 'bi-handbag';
    if (c.includes('home')) return 'bi-house-heart';
    if (c.includes('electronic')) return 'bi-headphones';
    if (c.includes('accessor')) return 'bi-watch';
    return 'bi-stars';
  }

  categoryClass(category: string): string {
    const c = category.toLowerCase();
    if (c.includes('mobile') || c.includes('phone')) return 'tile-blue';
    if (c.includes('laptop') || c.includes('computer')) return 'tile-purple';
    if (c.includes('fashion') || c.includes('cloth')) return 'tile-pink';
    if (c.includes('home')) return 'tile-green';
    if (c.includes('electronic')) return 'tile-orange';
    return 'tile-yellow';
  }

  getProductImage(product: Product): string {
    const saved = product.imageUrl || '';
    if (saved && !saved.includes('placehold.co')) return saved;
    const text = `${product.name} ${product.category}`.toLowerCase();
    if (text.includes('iphone') || text.includes('samsung') || text.includes('oneplus') || text.includes('mobile') || text.includes('phone')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=85';
    if (text.includes('laptop') || text.includes('dell') || text.includes('hp ') || text.includes('lenovo')) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=85';
    if (text.includes('headphone') || text.includes('airpod') || text.includes('boat')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85';
    if (text.includes('tv') || text.includes('printer')) return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=700&q=85';
    if (text.includes('shoe') || text.includes('sneaker') || text.includes('running')) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85';
    if (text.includes('kurti') || text.includes('t-shirt') || text.includes('shirt')) return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85';
    if (text.includes('watch')) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85';
    if (text.includes('backpack') || text.includes('bag')) return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85';
    if (text.includes('mixer') || text.includes('kitchen')) return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=85';
    return this.fallbackImage;
  }

  addToCart(product: Product): void {
    this.cart.add(product);
    this.notice = `${product.name} added to cart`;
    setTimeout(() => this.notice = '', 2200);
  }

  onImageError(event: Event): void { (event.target as HTMLImageElement).src = this.fallbackImage; }
  onHeroImageError(event: Event): void { (event.target as HTMLImageElement).src = this.fallbackImage; }
}
