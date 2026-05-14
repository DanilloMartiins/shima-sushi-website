import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from './product-card.component';
import { MenuCategoryResponse } from '@core/models/menu.models';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="menu-container">
      @for (category of categories; track category.id) {
        <section class="category-section">
          <h2 class="category-title">{{ category.name }}</h2>
          
          <div class="products-grid">
            @for (product of category.products; track product.id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
        </section>
      }
    </div>
  `
})
export class MenuListComponent {
  @Input({ required: true }) categories: MenuCategoryResponse[] = [];
}