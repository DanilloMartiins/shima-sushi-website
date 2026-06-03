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
      <p>O melhor sushi de Vitoria, agora com o cardápio oficial atualizado!</p>
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
          <article *ngFor="let item of category.products; trackBy: trackProduct" class="product-card">
            <!-- Proxy de imagem para evitar bloqueio de CORS do Yooga -->
            <img *ngIf="item.imageUrl" [src]="item.imageUrl.startsWith('/assets/') ? item.imageUrl : '/api/imagem?url=' + item.imageUrl" [alt]="item.name" loading="lazy" referrerpolicy="no-referrer" />
            
            <div class="product-info">
              <h4>{{ item.name }}</h4>
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
      .status-banner { border: 1px solid var(--brand-border); border-radius: 16px; padding: 1rem 1.2rem; background: rgba(23, 18, 20, 0.04); margin-bottom: 1.25rem; }
      .status-banner.open { background: rgba(234, 106, 61, 0.12); }
      .status-banner h2 { margin: 0; font-size: 1.05rem; }
      .status-banner p { margin: 0.3rem 0 0; color: var(--brand-muted); }

      .hero-copy { margin-bottom: 2rem; }
      .hero-copy h1 { margin: 0; font-size: clamp(2.2rem, 4vw, 3.4rem); }
      .hero-copy p { color: var(--brand-muted); margin: 0.65rem 0 1.2rem; max-width: 52ch; font-size: 1.18rem; }

      .loading-state, .error-state { margin: 1rem 0; padding: 1rem; border-radius: 10px; background: #fff; border: 1px solid var(--brand-border); text-align: center; }

      .category-wrap { margin: 2rem 0; }
      .category-wrap h3 { margin: 0 0 1.2rem; font-size: 1.8rem; color: var(--brand-ink); }

      .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
      .product-card { border: 1px solid var(--brand-border); border-radius: 18px; background: #fff; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.02); transition: transform 0.2s; }
      .product-card:hover { transform: translateY(-4px); }
      .product-card img { width: 100%; height: 160px; object-fit: cover; background: #f0f0f0; }

      .product-info { padding: 1.2rem; }
      .product-info h4 { margin: 0 0 1rem; font-size: 1.1rem; min-height: 2.4rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

      .card-footer { display: flex; justify-content: space-between; align-items: center; }
      .card-footer strong { font-size: 1.2rem; color: var(--brand-orange-strong); }
      .card-footer button { border: 0; border-radius: 99px; padding: 0.5rem 1.2rem; cursor: pointer; color: #fff; background: var(--brand-ink); font-weight: bold; }
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
        if (!settings) return;
        this.storeStatus.set(buildStoreStatus(settings));
      });
  }
}
