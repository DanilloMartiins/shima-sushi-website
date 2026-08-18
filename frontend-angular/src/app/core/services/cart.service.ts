import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { CART_STORAGE_KEY } from '../constants/api.constants';
import { ClerkService } from './clerk.service';
import { CartItem, SelectedOption } from '../models/cart.models';
import { ProductResponse } from '../models/menu.models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly clerk = inject(ClerkService);

  private readonly itemsSignal = signal<CartItem[]>(this.readStoredCart());

  readonly items = computed(() => this.itemsSignal());
  readonly totalItems = computed(() =>
    this.itemsSignal().reduce((accumulator, item) => accumulator + item.quantity, 0),
  );
  readonly totalPrice = computed(() =>
    this.itemsSignal().reduce((accumulator, item) => accumulator + item.quantity * item.price, 0),
  );

  constructor() {
    // Se a conta mudar (login/logout/troca de usuário), recarrega o carrinho daquela conta.
    // Sem conta logada o carrinho fica só em memória, não persiste entre sessões.
    let lastUserId: string | null = null;
    effect(() => {
      const userId = this.clerk.user()?.id ?? null;
      if (userId === lastUserId) {
        return;
      }
      lastUserId = userId;
      this.itemsSignal.set(this.readStoredCart(userId));
    });
  }

  addProduct(product: ProductResponse, quantity = 1, selectedOptions?: SelectedOption[]): void {
    const normalizedQuantity = quantity > 0 ? quantity : 1;
    const optionPriceAdd = (selectedOptions ?? []).reduce((acc, o) => acc + o.priceAddition, 0);
    const effectivePrice = product.price + optionPriceAdd;
    const customKey = selectedOptions?.length
      ? `${product.id}-${selectedOptions.map(o => o.optionId).sort().join(',')}`
      : `${product.id}`;

    const updatedCart = [...this.itemsSignal()];
    const existingItem = updatedCart.find((item) => item.customKey === customKey);

    if (existingItem) {
      existingItem.quantity += normalizedQuantity;
    } else {
      updatedCart.push({
        productId: product.id,
        name: product.name,
        price: effectivePrice,
        imageUrl: product.imageUrl,
        quantity: normalizedQuantity,
        selectedOptions,
        customKey,
      });
    }

    this.persist(updatedCart);
  }

  removeSingle(customKey: string): void {
    const updatedCart = this.itemsSignal()
      .map((item) =>
        item.customKey === customKey ? { ...item, quantity: item.quantity - 1 } : item,
      )
      .filter((item) => item.quantity > 0);

    this.persist(updatedCart);
  }

  clear(): void {
    this.persist([]);
  }

  private storageKey(userId: string): string {
    return `${CART_STORAGE_KEY}:${userId}`;
  }

  private persist(cart: CartItem[]): void {
    this.itemsSignal.set(cart);

    // Só persiste se tiver conta logada; cada conta tem a própria chave
    const userId = this.clerk.user()?.id ?? null;
    if (userId) {
      localStorage.setItem(this.storageKey(userId), JSON.stringify(cart));
    }
  }

  private readStoredCart(userId: string | null = null): CartItem[] {
    if (!userId) {
      return [];
    }

    const raw = localStorage.getItem(this.storageKey(userId));
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (item) =>
          typeof item.productId === 'number' &&
          typeof item.name === 'string' &&
          typeof item.price === 'number' &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0,
      );
    } catch {
      return [];
    }
  }
}