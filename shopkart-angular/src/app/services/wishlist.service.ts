import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly key = 'shopkart-wishlist';
  private load(): number[] { try { return JSON.parse(localStorage.getItem(this.key) || '[]') as number[]; } catch { return []; } }
  ids: number[] = this.load();
  has(id?: number): boolean { return !!id && this.ids.includes(id); }
  toggle(product: Product): void { if (!product.id) return; this.ids = this.has(product.id) ? this.ids.filter(id => id !== product.id) : [...this.ids, product.id]; try { localStorage.setItem(this.key, JSON.stringify(this.ids)); } catch {} }
}
