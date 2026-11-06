
import {
  Component,
  OnInit,
  OnDestroy,
  inject
} from '@angular/core';

import {
  CommonModule,
  CurrencyPipe
} from '@angular/common';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { FormsModule } from '@angular/forms';

import {
  Subject,
  takeUntil
} from 'rxjs';

import { Product } from '../models/product.model';
import { ProductReview } from '../models/product-review.model';

import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { ReviewService } from '../services/review.service';

@Component({
  selector: 'app-product-details',
  standalone: true,

  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    FormsModule
  ],

  template: `
    <div class="details-page">

      <a routerLink="/products" class="back-link">
        ← Back to Products
      </a>

      <div *ngIf="loading" class="message">
        Loading product...
      </div>

      <div *ngIf="errorMessage && !loading" class="message error">
        {{ errorMessage }}

        <button type="button" (click)="reloadProduct()">
          Retry
        </button>
      </div>

      <ng-container *ngIf="product && !loading">

        <article class="product-details">

          <div class="image-box">
            <img
              [src]="product.imageUrl || fallbackImage"
              [alt]="product.name"
              (error)="onImageError($event)"
            />
          </div>

          <div class="info">

            <span class="category">
              {{ product.category || 'General' }}
            </span>

            <h1>{{ product.name }}</h1>

            <div class="rating-summary">

              <span class="rating-number">
                {{ averageRating | number:'1.1-1' }}
              </span>

              <span class="stars">
                <span
                  *ngFor="let star of [1,2,3,4,5]"
                  [class.filled]="star <= roundedAverage"
                >★</span>
              </span>

              <span class="rating-count">
                {{ reviews.length }}
                {{ reviews.length === 1 ? 'Review' : 'Reviews' }}
              </span>

            </div>

            <p class="description">
              {{ product.description || 'A great product for everyday use.' }}
            </p>

            <h2>
              {{ product.price | currency:'INR':'symbol':'1.0-2' }}
            </h2>

            <p [class.out-of-stock]="product.stockQuantity < 1">
              {{ product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock' }}
            </p>

            <p class="stock">
              Available quantity: {{ product.stockQuantity }}
            </p>

            <button
              type="button"
              class="cart-button"
              (click)="addToCart()"
              [disabled]="product.stockQuantity < 1"
            >
              Add to Cart
            </button>

            <button
              type="button"
              class="refresh-button"
              (click)="reloadProduct()"
            >
              Refresh Details
            </button>

            <p class="notice" *ngIf="notice">
              {{ notice }}
            </p>

          </div>

        </article>

        <!-- REVIEWS SECTION -->

        <section class="reviews-section">

          <div class="section-heading">

            <div>
              <h2>Customer Reviews</h2>
              <p>See what customers think about this product.</p>
            </div>

            <div class="overall-rating">
              <strong>{{ averageRating | number:'1.1-1' }}</strong>

              <span class="stars">
                <span
                  *ngFor="let star of [1,2,3,4,5]"
                  [class.filled]="star <= roundedAverage"
                >★</span>
              </span>

              <small>{{ reviews.length }} ratings</small>
            </div>

          </div>

          <div *ngIf="reviewsLoading" class="review-message">
            Loading reviews...
          </div>

          <div *ngIf="reviewError" class="review-error">
            {{ reviewError }}
          </div>

          <!-- WRITE REVIEW -->

          <div class="review-form-card">

            <h3>Write a Product Review</h3>

            <div *ngIf="!isLoggedIn" class="login-message">
              Please login to write a review.
            </div>

            <form
              *ngIf="isLoggedIn"
              (ngSubmit)="submitReview()"
            >

              <label class="form-label">
                Your Rating
              </label>

              <div class="rating-input">

                <button
                  *ngFor="let star of [1,2,3,4,5]"
                  type="button"
                  [class.selected]="star <= selectedRating"
                  (click)="selectRating(star)"
                  [attr.aria-label]="'Give ' + star + ' stars'"
                >
                  ★
                </button>

              </div>

              <p class="rating-hint" *ngIf="selectedRating > 0">
                You selected {{ selectedRating }} out of 5 stars.
              </p>

              <label for="reviewComment" class="form-label">
                Your Review
              </label>

              <textarea
                id="reviewComment"
                name="reviewComment"
                [(ngModel)]="reviewComment"
                maxlength="1000"
                rows="4"
                placeholder="Share your experience with this product..."
                required
              ></textarea>

              <div class="character-count">
                {{ reviewComment.length }}/1000 characters
              </div>

              <button
                type="submit"
                class="submit-review-button"
                [disabled]="
                  submittingReview ||
                  selectedRating < 1 ||
                  !reviewComment.trim()
                "
              >
                {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
              </button>

            </form>

          </div>

          <p class="review-notice" *ngIf="reviewNotice">
            {{ reviewNotice }}
          </p>

          <!-- REVIEW LIST -->

          <div class="review-list">

            <h3>All Reviews ({{ reviews.length }})</h3>

            <div
              *ngIf="!reviewsLoading && reviews.length === 0"
              class="empty-reviews"
            >
              <div class="empty-icon">☆</div>
              <h4>No reviews yet</h4>
              <p>Be the first customer to review this product.</p>
            </div>

            <article
              class="review-card"
              *ngFor="let review of reviews"
            >

              <div class="review-top">

                <div class="review-user">

                  <div class="user-avatar">
                    {{ review.userName.charAt(0).toUpperCase() }}
                  </div>

                  <div>
                    <h4>{{ review.userName }}</h4>

                    <small>
                      {{ review.createdAt | date:'dd MMM yyyy' }}
                    </small>
                  </div>

                </div>

                <div class="review-stars">
                  <span
                    *ngFor="let star of [1,2,3,4,5]"
                    [class.filled]="star <= review.rating"
                  >★</span>
                </div>

              </div>

              <p class="review-comment">
                {{ review.comment }}
              </p>

            </article>

          </div>

        </section>

      </ng-container>

    </div>
  `,

  styles: [`
    .details-page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 30px 20px 60px;
      color: #1d2939;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 24px;
      color: #175cd3;
      text-decoration: none;
      font-weight: 700;
    }

    .product-details {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 35px;
      padding: 25px;
      background: white;
      border: 1px solid #eaecf0;
      border-radius: 14px;
    }

    .image-box {
      display: flex;
      min-height: 350px;
      align-items: center;
      justify-content: center;
      background: #f9fafb;
      border-radius: 12px;
      padding: 20px;
    }

    .image-box img {
      max-width: 100%;
      max-height: 400px;
      object-fit: contain;
    }

    .info {
      align-self: center;
    }

    .category {
      color: #667085;
      text-transform: uppercase;
      font-size: 12px;
      font-weight: 700;
    }

    h1 {
      margin: 12px 0;
      font-size: 30px;
    }

    .info h2 {
      font-size: 28px;
    }

    .description {
      color: #667085;
      line-height: 1.7;
    }

    .info button {
      padding: 13px 24px;
      margin: 5px 8px 5px 0;
      background: #2874f0;
      color: white;
      border: 0;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }

    .info button:disabled {
      background: #98a2b3;
      cursor: not-allowed;
    }

    .info .refresh-button {
      background: #475467;
    }

    .out-of-stock,
    .error {
      color: #b42318;
    }

    .message {
      padding: 25px;
      background: white;
      border-radius: 12px;
    }

    .notice {
      color: #067647;
      font-weight: 700;
    }

    .stock {
      color: #475467;
    }

    .rating-summary {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 9px;
      margin: 12px 0 18px;
    }

    .rating-number {
      font-weight: 800;
      color: #344054;
    }

    .stars,
    .review-stars {
      color: #d0d5dd;
      letter-spacing: 2px;
    }

    .stars .filled,
    .review-stars .filled {
      color: #f5a623;
    }

    .rating-count {
      color: #667085;
      font-size: 13px;
    }

    .reviews-section {
      margin-top: 35px;
      padding: 28px;
      background: #fff;
      border: 1px solid #eaecf0;
      border-radius: 14px;
    }

    .section-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 22px;
      border-bottom: 1px solid #eaecf0;
    }

    .section-heading h2 {
      margin: 0 0 7px;
      font-size: 24px;
    }

    .section-heading p {
      margin: 0;
      color: #667085;
    }

    .overall-rating {
      min-width: 130px;
      text-align: center;
    }

    .overall-rating strong {
      display: block;
      font-size: 32px;
      color: #101828;
    }

    .overall-rating small {
      display: block;
      margin-top: 5px;
      color: #667085;
    }

    .review-form-card {
      margin-top: 25px;
      padding: 22px;
      background: #f9fafb;
      border: 1px solid #eaecf0;
      border-radius: 12px;
    }

    .review-form-card h3,
    .review-list h3 {
      margin: 0 0 18px;
      font-size: 19px;
    }

    .login-message {
      padding: 12px;
      color: #175cd3;
      background: #eff8ff;
      border-radius: 8px;
    }

    .form-label {
      display: block;
      margin: 15px 0 8px;
      font-weight: 700;
      color: #344054;
    }

    .rating-input {
      display: flex;
      gap: 5px;
    }

    .rating-input button {
      padding: 0;
      border: 0;
      background: transparent;
      color: #d0d5dd;
      font-size: 34px;
      cursor: pointer;
    }

    .rating-input button.selected {
      color: #f5a623;
    }

    .rating-hint {
      margin: 4px 0 10px;
      color: #667085;
      font-size: 13px;
    }

    textarea {
      display: block;
      box-sizing: border-box;
      width: 100%;
      padding: 13px;
      border: 1px solid #d0d5dd;
      border-radius: 8px;
      outline: none;
      font: inherit;
      resize: vertical;
    }

    textarea:focus {
      border-color: #2874f0;
      box-shadow: 0 0 0 3px rgba(40, 116, 240, 0.1);
    }

    .character-count {
      margin-top: 5px;
      text-align: right;
      color: #667085;
      font-size: 12px;
    }

    .submit-review-button {
      margin-top: 15px;
      padding: 12px 22px;
      color: white;
      background: #2874f0;
      border: 0;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }

    .submit-review-button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .review-notice {
      margin-top: 15px;
      padding: 12px;
      color: #067647;
      background: #ecfdf3;
      border-radius: 8px;
    }

    .review-error {
      margin-top: 15px;
      padding: 12px;
      color: #b42318;
      background: #fef3f2;
      border-radius: 8px;
    }

    .review-list {
      margin-top: 30px;
    }

    .empty-reviews {
      padding: 35px 15px;
      text-align: center;
      background: #f9fafb;
      border-radius: 10px;
    }

    .empty-icon {
      color: #f5a623;
      font-size: 42px;
    }

    .empty-reviews h4 {
      margin: 8px 0;
    }

    .empty-reviews p {
      margin: 0;
      color: #667085;
    }

    .review-card {
      padding: 20px 0;
      border-bottom: 1px solid #eaecf0;
    }

    .review-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
    }

    .review-user {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      display: flex;
      width: 42px;
      height: 42px;
      align-items: center;
      justify-content: center;
      color: white;
      background: #2874f0;
      border-radius: 50%;
      font-weight: 800;
    }

    .review-user h4 {
      margin: 0 0 4px;
      font-size: 15px;
    }

    .review-user small {
      color: #667085;
    }

    .review-comment {
      margin: 15px 0 0 54px;
      color: #475467;
      line-height: 1.7;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    @media (max-width: 700px) {
      .product-details {
        grid-template-columns: 1fr;
        padding: 15px;
      }

      .image-box {
        min-height: 230px;
      }

      h1 {
        font-size: 25px;
      }

      .reviews-section {
        padding: 17px;
      }

      .section-heading {
        align-items: flex-start;
        flex-direction: column;
      }

      .overall-rating {
        text-align: left;
      }

      .review-top {
        align-items: flex-start;
        flex-direction: column;
      }

      .review-comment {
        margin-left: 0;
      }
    }
  `]
})

export class ProductDetailsComponent implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly reviewService = inject(ReviewService);

  private readonly destroy$ = new Subject<void>();

  product: Product | null = null;

  loading = true;
  errorMessage = '';
  notice = '';

  reviews: ProductReview[] = [];
  reviewsLoading = false;
  reviewError = '';
  reviewNotice = '';

  selectedRating = 0;
  reviewComment = '';
  submittingReview = false;

  isLoggedIn = false;

  readonly fallbackImage =
    'https://placehold.co/600x450/f2f5fa/52627a?text=ShopKart+Product';

  get averageRating(): number {
    if (this.reviews.length === 0) {
      return 0;
    }

    const total = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    return total / this.reviews.length;
  }

  get roundedAverage(): number {
    return Math.round(this.averageRating);
  }

  ngOnInit(): void {

    this.checkLogin();

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {

        const id = Number(params.get('id'));

        if (!Number.isInteger(id) || id <= 0) {
          this.product = null;
          this.loading = false;
          this.errorMessage = 'Invalid product ID.';
          return;
        }

        this.loadProduct(id);
        this.loadReviews(id);
      });
  }

  private checkLogin(): void {

    const savedUser = localStorage.getItem('shopkart-user');

    if (!savedUser) {
      this.isLoggedIn = false;
      return;
    }

    try {
      const user = JSON.parse(savedUser);
      this.isLoggedIn = !!user?.token;
    } catch {
      this.isLoggedIn = false;
    }
  }

  reloadProduct(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isInteger(id) && id > 0) {
      this.loadProduct(id);
      this.loadReviews(id);
    }
  }

  private loadProduct(id: number): void {

    this.loading = true;
    this.errorMessage = '';
    this.notice = '';

    this.productService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({

        next: product => {
          this.product = product;
          this.loading = false;
        },

        error: (error: Error) => {
          this.product = null;
          this.loading = false;

          this.errorMessage =
            error.message || 'Unable to load product details.';
        }
      });
  }

  private loadReviews(productId: number): void {

    this.reviewsLoading = true;
    this.reviewError = '';

    this.reviewService.getReviews(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({

        next: reviews => {
          this.reviews = reviews || [];
          this.reviewsLoading = false;
        },

        error: () => {
          this.reviews = [];
          this.reviewsLoading = false;
          this.reviewError = 'Unable to load product reviews.';
        }
      });
  }

  addToCart(): void {

    if (!this.product || this.product.stockQuantity < 1) {
      return;
    }

    try {
      this.cartService.add(this.product);
      this.notice = `${this.product.name} added to cart.`;
    } catch (error: unknown) {
      this.notice = error instanceof Error
        ? error.message
        : 'Unable to add product to cart.';
    }
  }

  selectRating(rating: number): void {
    this.selectedRating = rating;
  }

  submitReview(): void {

    if (!this.product) {
      return;
    }

    // FIX: Product ID undefined आहे का ते तपासा.
    const productId = this.product.id;

    if (
      productId == null ||
      !Number.isInteger(productId) ||
      productId <= 0
    ) {
      this.reviewError = 'Invalid product ID. Please reload the page.';
      return;
    }

    this.checkLogin();

    if (!this.isLoggedIn) {
      this.reviewNotice = '';
      this.reviewError = 'Please login before submitting a review.';
      return;
    }

    if (this.selectedRating < 1 || this.selectedRating > 5) {
      this.reviewError = 'Please select a rating from 1 to 5 stars.';
      return;
    }

    const comment = this.reviewComment.trim();

    if (!comment) {
      this.reviewError = 'Please enter your review.';
      return;
    }

    if (comment.length > 1000) {
      this.reviewError = 'Review must not exceed 1000 characters.';
      return;
    }

    this.submittingReview = true;
    this.reviewError = '';
    this.reviewNotice = '';

    this.reviewService.addReview(
      productId,
      {
        rating: this.selectedRating,
        comment: comment
      }
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({

      next: () => {

        this.submittingReview = false;

        this.reviewNotice =
          'Your review has been submitted successfully!';

        this.selectedRating = 0;
        this.reviewComment = '';

        // FIX: this.product!.id ऐवजी सुरक्षित productId वापरा.
        this.loadReviews(productId);
      },

      error: (error: any) => {

        this.submittingReview = false;

        const status = error?.status;

        const backendMessage =
          error?.error?.message ||
          error?.error?.detail;

        if (status === 401) {

          this.reviewError =
            'Your login session has expired. Please login again.';

        } else if (status === 403) {

          this.reviewError =
            backendMessage ||
            'You can review only products you have ordered.';

        } else if (status === 409) {

          this.reviewError =
            backendMessage ||
            'You have already reviewed this product.';

        } else if (status === 0) {

          this.reviewError =
            'Cannot connect to the backend. Check whether Spring Boot is running.';

        } else {

          this.reviewError =
            backendMessage || 'Unable to submit your review.';
        }
      }
    });
  }

  onImageError(event: Event): void {

    const image = event.target as HTMLImageElement;

    image.onerror = null;
    image.src = this.fallbackImage;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
