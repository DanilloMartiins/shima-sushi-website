import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductResponse } from '@core/models/menu.models';
import { CartService } from '@core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-card">
      <div class="product-info">
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <span class="price">{{ product.price | currency:'BRL' }}</span>
        <button (click)="addToCart()">Adicionar</button>
      </div>
    </div>
  `,
  styles: [`
    .product-card { border: 1px solid #ddd; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
    .price { font-weight: bold; display: block; margin: 8px 0; }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductResponse;
  private cartService = inject(CartService);

  addToCart() {
    this.cartService.addProduct(this.product);
  }
}
