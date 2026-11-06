
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly storageKey = 'shopkart-cart';
  private readonly cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());

  readonly cart$ = this.cartSubject.asObservable();

  constructor() {
    this.cartSubject.subscribe(items => {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(items));
      } catch {
        // Storage can be unavailable in private or restricted browser contexts.
      }
    });
  }

  private loadCart(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter((item): item is CartItem =>
        !!item &&
        typeof item === 'object' &&
        'product' in item &&
        !!item.product &&
        typeof item.product === 'object' &&
        'id' in item.product &&
        typeof item.product.id === 'number' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
      );
    } catch {
      return [];
    }
  }

  // Existing components use cart.items
  get items(): CartItem[] {
    return this.cartSubject.value;
  }

  // Existing AppComponent uses cart.count
  get count(): number {
    return this.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  // Existing CartComponent uses cart.total
  get total(): number {
    return this.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }

  getItems(): CartItem[] {
    return this.items;
  }

  getItemCount(): number {
    return this.count;
  }

  getTotal(): number {
    return this.total;
  }

  // Support both old and new method names.
  add(product: Product): void {
    this.addToCart(product);
  }

  addToCart(product: Product): void {
    if (product.id == null) {
      console.error('Cannot add product: product ID is missing.');
      return;
    }

    if (product.stockQuantity <= 0) {
      return;
    }

    const updatedItems = this.items.map(item => ({
      ...item,
      product: { ...item.product }
    }));

    const existingItem = updatedItems.find(
      item => item.product.id === product.id
    );

    if (existingItem) {
      if (existingItem.quantity >= product.stockQuantity) {
        return;
      }

      existingItem.quantity++;
    } else {
      updatedItems.push({
        product: { ...product },
        quantity: 1
      });
    }

    this.cartSubject.next(updatedItems);
  }

  // Existing CartComponent uses changeQuantity()
  changeQuantity(productId: number, quantity: number): void {
    this.updateQuantity(productId, quantity);
  }

  updateQuantity(productId: number, quantity: number): void {
    const existingItem = this.items.find(
      item => item.product.id === productId
    );

    if (!existingItem) {
      return;
    }

    if (quantity <= 0) {
      this.remove(productId);
      return;
    }

    if (quantity > existingItem.product.stockQuantity) {
      return;
    }

    const updatedItems = this.items.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    );

    this.cartSubject.next(updatedItems);
  }

  // Existing CartComponent uses remove()
  remove(productId: number): void {
    this.removeFromCart(productId);
  }

  removeFromCart(productId: number): void {
    this.cartSubject.next(
      this.items.filter(item => item.product.id !== productId)
    );
  }

  // Existing CartComponent uses clear()
  clear(): void {
    this.clearCart();
  }

  clearCart(): void {
    this.cartSubject.next([]);
  }
}
