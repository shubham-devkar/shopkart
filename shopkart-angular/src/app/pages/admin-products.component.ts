
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container p-4">
      <h2>Product Management</h2>
      <p>Manage your ShopKart products here.</p>
    </div>
  `
})
export class AdminProductsComponent {}
