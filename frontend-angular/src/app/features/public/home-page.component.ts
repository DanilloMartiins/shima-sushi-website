import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

import { MenuCategoryResponse, ProductResponse } from '../../core/models/menu.models';
import { StoreStatusSnapshot } from '../../core/models/store.models';
import { CartService } from '../../core/services/cart.service';
import { MenuService } from '../../core/services/menu.service';
import { StoreSettingsService } from '../../core/services/store-settings.service';
import { buildStoreStatus } from '../../core/utils/store-status.util';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <section class="status-banner" [class.open]="storeStatus()?.isOpenNow">
      <h2>{{ storeStatus()?.statusLabel ?? 'Carregando status...' }}</h2>
      <p>{{ storeStatus()?.detailLabel ?? 'Aguarde um instante.' }}</p>
    </section>

    <section class="hero-copy">
      <h1>Seu Shima Sushi</h1>
      <p>O melhor sushi de Vitoria, agora com o cardapio oficial atualizado!</p>
    </section>

    <section *ngIf="loading()" class="loading-state">
      <span class="shima-loader">
        <span class="shima-loader-icon" aria-hidden="true"></span>
        Carregando cardapio...
      </span>
    </section>
    
    <section *ngIf="errorMessage()" class="error-state">{{ errorMessage() }}</section>

    <!-- Lista de Categorias e Produtos -->
    <ng-container *ngFor="let category of menuCategories(); trackBy: trackCategory">
      <section class="category-wrap">
        <h3>{{ category.name }}</h3>

        <div class="product-grid">
          <article *ngFor="let item of category.products; trackBy: trackProduct"
                   class="product-card"
                   (click)="openProductModal(item)">
            <img *ngIf="item.imageUrl"
                 [src]="item.imageUrl.startsWith('/assets/') ? item.imageUrl : '/api/imagem?url=' + item.imageUrl"
                 [alt]="item.name" loading="lazy" referrerpolicy="no-referrer" />
            
            <div class="product-info">
              <h4>{{ item.name }}</h4>
              <div class="card-footer">
                <strong>{{ item.price | currency: 'BRL' }}</strong>
                <button type="button" (click)="$event.stopPropagation(); openProductModal(item)">Adicionar</button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </ng-container>

    <!-- Modal do Produto -->
    <div *ngIf="selectedProduct() as product" class="modal-overlay" (click)="closeProductModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button type="button" class="modal-close" (click)="closeProductModal()">&times;</button>

        <img *ngIf="product.imageUrl"
             [src]="product.imageUrl.startsWith('/assets/') ? product.imageUrl : '/api/imagem?url=' + product.imageUrl"
             [alt]="product.name" class="modal-image" />

        <div class="modal-body">
          <h2>{{ product.name }}</h2>
          <p *ngIf="product.description" class="modal-description">{{ product.description }}</p>
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
  `,
  styles: [
    `
      .status-banner { border: 1px solid var(--brand-border); border-radius: 16px; padding: 1rem 1.2rem; background: rgba(23, 18, 20, 0.04); margin-bottom: 1.25rem; }
      .status-banner.open { background: rgba(234, 106, 61, 0.12); }
      .status-banner h2 { margin: 0; font-size: 1.05rem; }
      .status-banner p { margin: 0.3rem 0 0; color: var(--brand-muted); }

      .hero-copy { margin-bottom: 2rem; }
      .hero-copy h1 { margin: 0; font-size: clamp(2rem, 4vw, 3.4rem); }
      .hero-copy p { color: var(--brand-muted); margin: 0.65rem 0 1.2rem; max-width: 52ch; font-size: 1.1rem; }

      .loading-state, .error-state { margin: 1rem 0; padding: 1rem; border-radius: 10px; background: #fff; border: 1px solid var(--brand-border); text-align: center; }

      .category-wrap { margin: 2rem 0; }
      .category-wrap h3 { margin: 0 0 1rem; font-size: 1.6rem; color: var(--brand-ink); }

      .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.2rem; }
      .product-card { border: 1px solid var(--brand-border); border-radius: 16px; background: #fff; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.02); transition: transform 0.2s; cursor: pointer; }
      .product-card:hover { transform: translateY(-4px); }
      .product-card img { width: 100%; height: 150px; object-fit: cover; background: #f0f0f0; }

      .product-info { padding: 0.85rem 1rem; }
      .product-info h4 { margin: 0 0 0.5rem; font-size: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.35; }

      .card-footer { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
      .card-footer strong { font-size: 1.1rem; color: var(--brand-orange-strong); white-space: nowrap; }
      .card-footer button { border: 0; border-radius: 8px; padding: 0.35rem 0.8rem; cursor: pointer; color: #fff; background: var(--brand-ink); font-weight: 600; font-size: 0.85rem; line-height: 1.35; }

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
        border: none; border-radius: 50%;
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

      /* Mobile */
      @media (max-width: 600px) {
        .hero-copy p { font-size: 1rem; }
        .category-wrap h3 { font-size: 1.3rem; }
        .product-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.7rem; }
        .product-card img { height: 110px; }
        .product-info { padding: 0.65rem 0.75rem; }
        .product-info h4 { font-size: 0.88rem; margin-bottom: 0.4rem; }
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
        .modal-content { border-radius: 14px 14px 0 0; max-height: 90vh; overflow-y: auto; }
      }
    `,
  ],
})
export class HomePageComponent implements OnInit {
  private readonly menuService = inject(MenuService);
  private readonly storeSettingsService = inject(StoreSettingsService);
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly latestStoreSettings = signal<Parameters<typeof buildStoreStatus>[0] | null>(null);

  readonly menuCategories = signal<MenuCategoryResponse[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly storeStatus = signal<StoreStatusSnapshot | null>(null);

  readonly selectedProduct = signal<ProductResponse | null>(null);
  readonly selectedQuantity = signal(1);

  ngOnInit(): void {
    this.loadMenu();
    this.loadStoreStatus();
    this.watchStoreStatus();
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

  trackCategory(_index: number, category: MenuCategoryResponse): number {
    return category.id;
  }

  trackProduct(_index: number, product: ProductResponse): number {
    return product.id;
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

  private loadStoreStatus(): void {
    this.storeSettingsService.getPublicStoreSettings().subscribe({
      next: (settings) => {
        this.latestStoreSettings.set(settings);
        this.storeStatus.set(buildStoreStatus(settings));
      },
      error: () => {
        this.storeStatus.set({
          isOpenNow: false,
          statusLabel: 'Status indisponivel',
          detailLabel: 'Nao conseguimos obter o horario agora.',
        });
      },
    });
  }

  private watchStoreStatus(): void {
    interval(60_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const settings = this.latestStoreSettings();
        if (!settings) return;
        this.storeStatus.set(buildStoreStatus(settings));
      });
  }
}
