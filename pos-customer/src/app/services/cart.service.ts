import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems = signal<CartItem[]>([]);
  discount = signal<number>(0);

  // Computed values
  subtotal = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.price * item.qty, 0);
  });

  total = computed(() => {
    return Math.max(0, this.subtotal() - this.discount());
  });

  itemCount = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.qty, 0);
  });

  addItem(item: { id: string; name: string; price: number }, qty: number = 1): void {
    const currentItems = this.cartItems();
    const existingItem = currentItems.find(i => i.id === item.id);

    if (existingItem) {
      // Increment quantity
      const updatedItems = currentItems.map(i =>
        i.id === item.id ? { ...i, qty: i.qty + qty } : i
      );
      this.cartItems.set(updatedItems);
    } else {
      // Add new item
      this.cartItems.set([...currentItems, { ...item, qty }]);
    }
  }

  removeItem(itemId: string): void {
    const currentItems = this.cartItems();
    this.cartItems.set(currentItems.filter(item => item.id !== itemId));
  }

  updateQuantity(itemId: string, qty: number): void {
    if (qty <= 0) {
      this.removeItem(itemId);
      return;
    }

    const currentItems = this.cartItems();
    const updatedItems = currentItems.map(item =>
      item.id === itemId ? { ...item, qty } : item
    );
    this.cartItems.set(updatedItems);
  }

  setDiscount(amount: number): void {
    this.discount.set(Math.max(0, amount));
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.discount.set(0);
  }

  getCartItems(): CartItem[] {
    return this.cartItems();
  }
}

