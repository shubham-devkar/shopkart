
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-admin-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="admin-page">

      <div class="page-heading">
        <div>
          <p class="eyebrow">SHOPKART ADMIN</p>
          <h1>{{ editingId !== null ? 'Update Product' : 'Add New Product' }}</h1>
          <p>Manage your store products from here.</p>
        </div>

        <a routerLink="/products" class="back-btn">
          <i class="bi bi-arrow-left"></i> Back to Products
        </a>
      </div>

      <section class="form-card">

        <p class="success" *ngIf="successMessage">{{ successMessage }}</p>
        <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>

        <form #productForm="ngForm" (ngSubmit)="saveProduct()">

          <div class="form-grid">

            <div class="field">
              <label>Product Name *</label>
              <input
                name="name"
                [(ngModel)]="formProduct.name"
                placeholder="Enter product name"
                required
                maxlength="150"
              />
            </div>

            <div class="field">
              <label>Category *</label>
              <input
                name="category"
                [(ngModel)]="formProduct.category"
                placeholder="Example: Electronics"
                required
              />
            </div>

            <div class="field">
              <label>Price (₹) *</label>
              <input
                name="price"
                type="number"
                [(ngModel)]="formProduct.price"
                placeholder="Enter price"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div class="field">
              <label>Stock Quantity *</label>
              <input
                name="stockQuantity"
                type="number"
                [(ngModel)]="formProduct.stockQuantity"
                placeholder="Enter stock quantity"
                min="0"
                step="1"
                required
              />
            </div>

            <div class="field full-width">
              <label>Product Image URL</label>
              <input
                name="imageUrl"
                [(ngModel)]="formProduct.imageUrl"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div class="field full-width">
              <label>Description</label>
              <textarea
                name="description"
                [(ngModel)]="formProduct.description"
                placeholder="Enter product description"
                rows="4"
              ></textarea>
            </div>

          </div>

          <div class="image-preview" *ngIf="formProduct.imageUrl">
            <strong>Image Preview</strong>
            <img
              [src]="getImageUrl(formProduct.imageUrl)"
              alt="Product preview"
              (error)="onPreviewError($event)"
            />
          </div>

          <label class="active-label">
            <input
              type="checkbox"
              name="active"
              [(ngModel)]="formProduct.active"
            />
            Product Active
          </label>

          <div class="form-actions">

            <button
              class="save-btn"
              type="submit"
              [disabled]="productForm.invalid || saving"
            >
              <i class="bi bi-check-circle"></i>
              {{ saving ? 'Saving...' : editingId !== null ? 'Update Product' : 'Save Product' }}
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
      width: min(950px, 94%);
      margin: auto;
      padding: 35px 0 55px;
    }

    .page-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
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

    .page-heading p:last-child {
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

    .form-card {
      padding: 28px;
      border: 1px solid #e4e9f2;
      border-radius: 15px;
      background: white;
      box-shadow: 0 5px 20px #0f172a0a;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
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
    .field textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #d8deea;
      border-radius: 8px;
      font: inherit;
      outline: none;
    }

    .field input:focus,
    .field textarea:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px #2563eb18;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .image-preview {
      margin-top: 22px;
      padding: 15px;
      border: 1px solid #e4e9f2;
      border-radius: 10px;
    }

    .image-preview img {
      display: block;
      max-width: 190px;
      max-height: 160px;
      margin-top: 12px;
      object-fit: contain;
    }

    .active-label {
      display: flex;
      align-items: center;
      gap: 9px;
      margin-top: 22px;
      color: #334155;
      font-weight: 600;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 25px;
    }

    .save-btn,
    .clear-btn {
      padding: 12px 20px;
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

    @media (max-width: 650px) {
      .page-heading {
        align-items: flex-start;
        flex-direction: column;
      }

      .form-card {
        padding: 18px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .full-width {
        grid-column: auto;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class AdminAddProductComponent implements OnInit {

  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);

  saving = false;
  editingId: number | null = null;
  errorMessage = '';
  successMessage = '';

  formProduct: Product = this.emptyProduct();

  readonly fallbackImage =
    'https://placehold.co/400x400/f2f5fa/52627a?text=ShopKart+Product';

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');

    if (id) {
      this.loadProductForEdit(Number(id));
    }
  }

  private loadProductForEdit(id: number): void {
    this.productService.getAll().subscribe({
      next: products => {
        const product = products.find(item => item.id === id);

        if (!product) {
          this.errorMessage = 'Product not found.';
          return;
        }

        this.editingId = id;
        this.formProduct = { ...product };
      },
      error: error => {
        console.error(error);
        this.errorMessage = 'Unable to load product details.';
      }
    });
  }

  saveProduct(): void {
    const name = this.formProduct.name?.trim();
    const category = this.formProduct.category?.trim();
    const price = Number(this.formProduct.price);
    const stock = Number(this.formProduct.stockQuantity);

    if (!name || !category || !Number.isFinite(price) ||
        price <= 0 || !Number.isInteger(stock) || stock < 0) {
      this.errorMessage = 'Please enter valid product details.';
      return;
    }

    const payload: Product = {
      ...this.formProduct,
      name,
      category,
      price,
      stockQuantity: stock,
      description: this.formProduct.description ?? '',
      imageUrl: this.formProduct.imageUrl?.trim() ?? '',
      active: this.formProduct.active ?? true
    };

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = this.editingId !== null
      ? this.productService.update(this.editingId, payload)
      : this.productService.create(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = this.editingId !== null
          ? 'Product updated successfully.'
          : 'Product added successfully.';

        this.resetForm();
      },
      error: error => {
        console.error('Save product failed:', error);
        this.saving = false;
        this.errorMessage = error.error?.message ||
          (error.status === 403
            ? 'Admin permission missing. Please login as admin.'
            : 'Product save failed. Check backend API.');
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.formProduct = this.emptyProduct();
  }

  getImageUrl(path: string | null | undefined): string {
    if (!path?.trim()) return this.fallbackImage;

    const imagePath = path.trim();

    if (/^https?:\/\//i.test(imagePath)) return imagePath;

    return `https://shopkart-3-fbca.onrender.com${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }

  onPreviewError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = this.fallbackImage;
  }

  private emptyProduct(): Product {
    return {
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      category: '',
      imageUrl: '',
      active: true
    };
  }
}
