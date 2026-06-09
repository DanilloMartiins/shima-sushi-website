import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { API_BASE_RAW } from '../../core/constants/api.constants';
import { MenuCategoryResponse, ProductResponse } from '../../core/models/menu.models';
import { CartService } from '../../core/services/cart.service';
import { MenuService } from '../../core/services/menu.service';
import { gerarSlug } from '../../core/utils/menu.utils';
import { MenuCarouselComponent, CategoriaCarrossel } from './menu-carousel.component';

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MenuCarouselComponent],
  template: `
    @if (loading()) {
      <section class="loading-state">
        <span class="shima-loader">
          <span class="shima-loader-icon" aria-hidden="true"></span>
          Carregando cardapio...
        </span>
      </section>
    }

    @if (errorMessage(); as msg) {
      <section class="error-state">{{ msg }}</section>
    }

    @if (categoriasCarrossel().length > 0) {
      <app-menu-carousel
        [categorias]="categoriasCarrossel()"
        [ativa]="categoriaAtiva()"
        (categoriaChange)="onCategoriaChange($event)"
      />
    }

    <div class="menu-page-container">
      @for (cat of categoriasExibidas(); track cat.slug) {
        <section class="category-wrap">
          <h3>{{ cat.nome }}</h3>

          <div class="product-grid">
            @for (item of cat.produtos; track item.id) {
              <article class="product-card" (click)="openProductModal(item)">
                @if (item.imageUrl) {
                  <img
                    [src]="getImageUrl(item.imageUrl)"
                    [alt]="item.name"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                  />
                }

                <div class="product-info">
                  @if (item.tag) {
                    <span class="product-tag">{{ item.tag }}</span>
                  }
                  <h4>{{ item.name }}</h4>
                  <div class="card-footer">
                    <strong>{{ item.price | currency: 'BRL' }}</strong>
                    <button type="button" (click)="$event.stopPropagation(); openProductModal(item)">
                      Adicionar
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        </section>
      }
    </div>

    @if (selectedProduct(); as product) {
      <div class="modal-overlay" (click)="closeProductModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button type="button" class="modal-close" (click)="closeProductModal()">&times;</button>

          @if (product.imageUrl) {
            <img
              [src]="getImageUrl(product.imageUrl)"
              [alt]="product.name"
              class="modal-image"
            />
          }

          <div class="modal-body">
            <h2>{{ product.name }}</h2>
            @if (product.description) {
              <p class="modal-description">{{ product.description }}</p>
            }
            <strong class="modal-price">{{ product.price | currency: 'BRL' }}</strong>

            <div class="modal-actions">
              <div class="quantity-control">
                <button type="button" (click)="decreaseQuantity()" [disabled]="selectedQuantity() <= 1">-</button>
                <span class="quantity-value">{{ selectedQuantity() }}</span>
                <button type="button" (click)="increaseQuantity()">+</button>
              </div>

              <button type="button" class="btn-confirm" (click)="confirmAddToCart()">Confirmar</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-state, .error-state {
      margin: 1rem 0; padding: 1rem; border-radius: 10px;
      background: #fff; border: 1px solid var(--brand-border); text-align: center;
    }

    .category-wrap { margin: 2rem 0; scroll-margin-top: 4.5rem; }
    .category-wrap h3 { margin: 0 0 1rem; font-size: 1.6rem; color: var(--brand-ink); }

    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.2rem; }
    .product-card {
      border: 1px solid var(--brand-border); border-radius: 16px; background: #fff;
      overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.02);
      transition: transform 0.2s; cursor: pointer;
      display: flex; flex-direction: column;
    }
    .product-card:hover { transform: translateY(-4px); }
    .product-card img { width: 100%; height: 150px; object-fit: cover; background: #f0f0f0; }

    .product-info {
      padding: 0.85rem 1rem;
      display: flex; flex-direction: column; gap: 0.25rem;
      flex: 1;
    }
    .product-tag {
      display: inline-block;
      background: rgba(234, 106, 61, 0.1);
      color: var(--brand-orange-strong, #c85a2f);
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      width: fit-content;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .product-info h4 { margin: 0; font-size: 1rem; line-height: 1.35; }

    .card-footer {
      margin-top: auto;
      display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;
      padding-top: 0.4rem;
    }
    .card-footer strong { font-size: 1.1rem; color: var(--brand-orange-strong); white-space: nowrap; }
    .card-footer button {
      border: 0; border-radius: 8px; padding: 0.35rem 0.8rem;
      cursor: pointer; color: #fff; background: var(--brand-ink);
      font-weight: 600; font-size: 0.85rem; line-height: 1.35;
    }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(0, 0, 0, 0.55);
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
    }
    .modal-content {
      background: #fff; border-radius: 16px;
      max-width: 380px; width: 100%;
      overflow: hidden; position: relative;
      box-shadow: 0 12px 40px rgba(0,0,0,0.25);
    }
    .modal-close {
      position: absolute; top: 8px; right: 10px;
      background: rgba(0,0,0,0.5); color: #fff;
      border: none; border-radius: 8px;
      width: 28px; height: 28px;
      font-size: 1.1rem; line-height: 1;
      cursor: pointer; z-index: 10;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-image { width: 100%; height: 180px; object-fit: cover; background: #f0f0f0; }
    .modal-body { padding: 1rem 1.1rem 1.1rem; }
    .modal-body h2 { margin: 0 0 0.3rem; font-size: 1.15rem; }
    .modal-description { color: var(--brand-muted); font-size: 0.85rem; margin: 0 0 0.5rem; line-height: 1.45; }
    .modal-price { font-size: 1.2rem; color: var(--brand-orange-strong); display: block; margin-bottom: 0.85rem; }

    .modal-actions { display: flex; align-items: center; gap: 0.6rem; }
    .quantity-control {
      display: flex; align-items: center; gap: 0;
      border: 1px solid var(--brand-border); border-radius: 8px; overflow: hidden;
      flex-shrink: 0;
    }
    .quantity-control button {
      border: none; background: transparent;
      width: 32px; height: 34px; font-size: 1rem;
      cursor: pointer; color: var(--brand-ink);
      font-weight: 700; transition: background 0.15s;
    }
    .quantity-control button:hover { background: rgba(0,0,0,0.05); }
    .quantity-control button:disabled { opacity: 0.3; cursor: not-allowed; }
    .quantity-control .quantity-value {
      min-width: 28px; text-align: center; font-weight: 700; font-size: 0.85rem;
    }
    .btn-confirm {
      flex: 1; border: none; border-radius: 8px;
      padding: 0.35rem 0.8rem;
      background: var(--brand-orange); color: #fff;
      font-weight: 700; font-size: 0.85rem;
      cursor: pointer; transition: filter 0.15s;
      white-space: nowrap; line-height: 1.35;
    }
    .btn-confirm:hover { filter: brightness(1.1); }

    @media (max-width: 600px) {
      .category-wrap h3 { font-size: 1.3rem; }
      .product-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.7rem; }
      .product-card img { height: 110px; }
      .product-info { padding: 0.65rem 0.75rem; }
      .product-info h4 { font-size: 0.88rem; }
      .card-footer strong { font-size: 1rem; }
      .card-footer button { padding: 0.35rem 0.8rem; font-size: 0.85rem; }
      .modal-content { max-width: 340px; }
      .modal-image { height: 160px; }
      .modal-body { padding: 0.85rem 0.9rem 0.95rem; }
      .modal-body h2 { font-size: 1.05rem; }
      .modal-actions { gap: 0.4rem; }
      .quantity-control button { width: 30px; height: 30px; font-size: 0.9rem; }
      .btn-confirm { padding: 0.35rem 0.7rem; font-size: 0.85rem; }
    }

    @media (max-width: 380px) {
      .product-grid { grid-template-columns: 1fr; }
      .product-card img { height: 140px; }
      .modal-content { max-width: 100%; margin: 0; border-radius: 0; }
      .modal-overlay { padding: 0; align-items: flex-end; }
      .modal-content { border-radius: 14px 14px 0 0; max-height: 90dvh; -webkit-overflow-scrolling: touch; overflow-y: auto; }
    }
  `],
})
export class MenuPageComponent implements OnInit {
  private readonly menuService = inject(MenuService);
  private readonly cartService = inject(CartService);

  readonly menuCategories = signal<MenuCategoryResponse[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly categoriaAtiva = signal('todos');

  readonly selectedProduct = signal<ProductResponse | null>(null);
  readonly selectedQuantity = signal(1);

  readonly categoriasCarrossel = computed<CategoriaCarrossel[]>(() => {
    const cats = this.menuCategories().map((c) => ({
      slug: gerarSlug(c.name),
      nome: c.name,
    }));
    return [{ slug: 'todos', nome: 'Todos' }, ...cats];
  });

  readonly categoriasExibidas = computed(() => {
    const slugAtivo = this.categoriaAtiva();
    const todas = this.menuCategories().map((c) => ({
      slug: gerarSlug(c.name),
      nome: c.name,
      produtos: c.products,
    }));

    if (slugAtivo === 'todos') return todas;
    return todas.filter((c) => c.slug === slugAtivo);
  });

  ngOnInit(): void {
    this.loadMenu();
  }

  openProductModal(product: ProductResponse): void {
    this.selectedProduct.set(product);
    this.selectedQuantity.set(1);
  }

  closeProductModal(): void {
    this.selectedProduct.set(null);
  }

  increaseQuantity(): void {
    this.selectedQuantity.update(q => q + 1);
  }

  decreaseQuantity(): void {
    this.selectedQuantity.update(q => Math.max(1, q - 1));
  }

  confirmAddToCart(): void {
    const product = this.selectedProduct();
    if (product) {
      this.cartService.addProduct(product, this.selectedQuantity());
      this.closeProductModal();
    }
  }

  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
      return '';
    }
    if (imageUrl.startsWith('/assets/')) {
      return imageUrl;
    }
    if (imageUrl.startsWith('/images/')) {
      return `${API_BASE_RAW}${imageUrl}`;
    }
    return `${API_BASE_RAW}/api/imagem?url=${encodeURIComponent(imageUrl)}`;
  }

  onCategoriaChange(slug: string): void {
    this.categoriaAtiva.set(slug);
  }

  private loadMenu(): void {
    this.menuService.getPublicMenu().subscribe({
      next: (categories) => {
        this.menuCategories.set(categories);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Nao foi possivel carregar o cardapio agora.');
        this.loading.set(false);
      },
    });
  }
}
