import { Injectable, signal, computed, effect } from '@angular/core';
import { Product } from '@features/menu/models/menu.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<CartItem[]>(this.loadCartFromStorage());

  public cartTotal = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.product.price * item.quantity), 0);
  });

  public cartItemCount = computed(() => {
    return this.cartItems().reduce((count, item) => count + item.quantity, 0);
  });

  constructor() {
    // Persiste o estado do carrinho no localStorage sempre que ele for alterado.
    effect(() => {
      localStorage.setItem('seu-shima-cart', JSON.stringify(this.cartItems()));
    });
  }

  private loadCartFromStorage(): CartItem[] {
    const saved = localStorage.getItem('seu-shima-cart');
    return saved ? JSON.parse(saved) : [];
  }

  public addItem(product: Product): void {
    this.cartItems.update(items => {
      const existingItem = items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return items.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      
      return [...items, { product, quantity: 1 }];
    });
  }
}