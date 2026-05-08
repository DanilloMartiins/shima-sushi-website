import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
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
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
    <section class="status-banner" [class.open]="storeStatus()?.isOpenNow">
      <h2>{{ storeStatus()?.statusLabel ?? 'Carregando status...' }}</h2>
      <p>{{ storeStatus()?.detailLabel ?? 'Aguarde um instante.' }}</p>
    </section>

    <section class="hero-copy">
      <h1>Seu Shima Sushi</h1>
      <p>
        Monte seu pedido, acompanhe historico e finalize no fluxo novo da plataforma.
      </p>
      <a routerLink="/checkout" class="checkout-link">Ir para checkout</a>
    </section>

    <section *ngIf="loading()" class="loading-state">
      <span class="shima-loader">
        <span class="shima-loader-icon" aria-hidden="true"></span>
        Carregando cardapio...
      </span>
    </section>
    <section *ngIf="errorMessage()" class="error-state">{{ errorMessage() }}</section>

    <ng-container *ngFor="let category of menuCategories(); trackBy: trackCategory">
      <section class="category-wrap">
        <h3>{{ category.title }}</h3>

        <div class="product-grid">
          <article *ngFor="let item of category.items; trackBy: trackProduct" class="product-card">
            <img *ngIf="item.imageUrl" [src]="item.imageUrl" [alt]="item.name" loading="lazy" />
            <div class="product-info">
              <p class="tag" *ngIf="item.tag">{{ item.tag }}</p>
              <h4>{{ item.name }}</h4>
              <p class="description">{{ item.description }}</p>
              <div class="card-footer">
                <strong>{{ item.price | currency: 'BRL' }}</strong>
                <button type="button" (click)="addToCart(item)">Adicionar</button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </ng-container>
  `,
  styles: [
    `
      .status-banner {
        border: 1px solid var(--brand-border);
        border-radius: 16px;
        padding: 1rem 1.2rem;
        background: rgba(23, 18, 20, 0.04);
        margin-bottom: 1.25rem;
      }

      .status-banner.open {
        background: rgba(234, 106, 61, 0.12);
      }

      .status-banner h2 {
        margin: 0;
        font-size: 1.05rem;
      }

      .status-banner p {
        margin: 0.3rem 0 0;
        color: var(--brand-muted);
      }

      .hero-copy {
        margin-bottom: 1.25rem;
      }

      .hero-copy h1 {
        margin: 0;
        font-size: clamp(2.2rem, 4vw, 3.4rem);
      }

      .hero-copy p {
        color: var(--brand-muted);
        margin: 0.65rem 0 1.2rem;
        max-width: 52ch;
        font-size: 1.18rem;
      }

      .checkout-link {
        display: inline-flex;
        text-decoration: none;
        color: #fff;
        background: var(--brand-orange);
        border-radius: 999px;
        padding: 0.62rem 1.05rem;
        font-weight: 600;
        font-size: 1.06rem;
      }

      .loading-state,
      .error-state {
        margin: 1rem 0;
        padding: 0.8rem;
        border-radius: 10px;
        background: var(--brand-surface);
        border: 1px solid var(--brand-border);
      }

      .error-state {
        border: 1px solid rgba(217, 91, 47, 0.5);
      }

      .category-wrap {
        margin: 1.6rem 0;
      }

      .category-wrap h3 {
        margin: 0 0 0.9rem;
        font-size: 1.95rem;
      }

      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
        gap: 1rem;
      }

      .product-card {
        border: 1px solid var(--brand-border);
        border-radius: 14px;
        background: var(--brand-surface);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
      }

      .product-card img {
        width: 100%;
        height: 148px;
        object-fit: cover;
        background: rgba(0, 0, 0, 0.2);
      }

      .product-info {
        padding: 1rem;
      }

      .tag {
        margin: 0;
        color: var(--brand-orange-strong);
        font-size: 0.75rem;
      }

      .product-info h4 {
        margin: 0.25rem 0;
      }

      .description {
        color: var(--brand-muted);
        min-height: 2.8rem;
        font-size: 0.9rem;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.8rem;
      }

      .card-footer button {
        border: 0;
        border-radius: 999px;
        padding: 0.35rem 0.7rem;
        cursor: pointer;
        color: #fff;
        background: var(--brand-ink);
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

  ngOnInit(): void {
    this.loadMenu();
    this.loadStoreStatus();
    this.watchStoreStatus();
  }

  addToCart(product: ProductResponse): void {
    this.cartService.addProduct(product);
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
        if (!settings) {
          return;
        }

        this.storeStatus.set(buildStoreStatus(settings));
      });
  }
}
