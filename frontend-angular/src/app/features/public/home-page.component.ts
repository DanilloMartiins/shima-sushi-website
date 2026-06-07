import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { interval } from 'rxjs';

import { DAY_LABELS } from '../../core/models/store.models';
import { StoreSettingsResponse, StoreStatusSnapshot } from '../../core/models/store.models';
import { StoreSettingsService } from '../../core/services/store-settings.service';
import { MenuService } from '../../core/services/menu.service';
import { FeaturedProductResponse } from '../../core/models/menu.models';
import { buildStoreStatus } from '../../core/utils/store-status.util';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="status-banner" [class.open]="storeStatus()?.isOpenNow">
      <h2>{{ storeStatus()?.statusLabel ?? 'Carregando status...' }}</h2>
      <p>{{ storeStatus()?.detailLabel ?? 'Aguarde um instante.' }}</p>
    </section>

    <section class="hero-copy">
      <h1>Seu Shima Sushi</h1>
      <p>O melhor sushi de Vitória, agora com o cardápio oficial atualizado!</p>
    </section>

    <!-- Carrossel: Os Mais Pedidos -->
    <section class="featured-section" *ngIf="featuredProducts().length > 0">
      <div class="featured-header">
        <h2>Os Mais Pedidos</h2>
        <a class="featured-link" routerLink="/cardapio">Ver cardápio completo →</a>
      </div>
      <div class="featured-carousel">
        <div
          class="featured-card"
          *ngFor="let product of featuredProducts(); trackBy: trackFeatured"
        >
          <div class="featured-card-img">
            <img
              [src]="product.imageUrl"
              [alt]="product.name"
              loading="lazy"
              (error)="product.imageUrl = '/assets/images/product_placeholder.png'"
            />
          </div>
          <div class="featured-card-body">
            <h3>{{ product.name }}</h3>
            <p>{{ product.description }}</p>
            <span class="featured-price">{{ product.price | currency : 'BRL' }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Informações da Loja -->
    <section class="store-info" *ngIf="storeSettings() as s">
      <!-- Mapa + Endereço lado a lado -->
      <div class="location-content" *ngIf="s.storeProfile?.addressStreet && s.storeProfile?.addressNumber">
        <div class="map-wrapper">
          <iframe
            [src]="mapUrl()"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <div class="location-details">
          <div class="loc-row">
            <span class="loc-icon">📍</span>
            <div>
              <strong>Endereço</strong>
              <span class="loc-line">{{ s.storeProfile?.addressStreet }}, {{ s.storeProfile?.addressNumber }}</span>
              <span class="loc-line" *ngIf="s.storeProfile?.neighborhood">{{ s.storeProfile?.neighborhood }}</span>
              <span class="loc-line" *ngIf="s.storeProfile?.city">{{ s.storeProfile?.city }}</span>
              <span class="loc-line" *ngIf="s.storeProfile?.zipCode">CEP {{ s.storeProfile?.zipCode }}</span>
              <span class="loc-line loc-ref" *ngIf="s.storeProfile?.referencePoint">{{ s.storeProfile?.referencePoint }}</span>
            </div>
          </div>
          <a class="loc-whatsapp" *ngIf="s.whatsappNumber" [href]="'https://wa.me/' + s.whatsappNumber" target="_blank" rel="noopener">
            <span class="loc-icon">📱</span>
            <div>
              <strong>WhatsApp</strong>
              <span>{{ s.whatsappNumber }}</span>
            </div>
          </a>
        </div>
      </div>

      <!-- Horários -->
      <details class="info-card info-details" *ngIf="s.businessHours?.length">
        <summary class="info-summary">
          <span class="info-icon">🕐</span>
          <div>
            <strong>Horários de Funcionamento</strong>
            <span>Clique para ver os horários</span>
          </div>
        </summary>
        <div class="hours-list">
          <div class="hour-item" *ngFor="let day of s.businessHours; trackBy: trackDay">
            <span class="hour-day">{{ DAY_LABELS[day.dayOfWeek] }}</span>
            <span class="hour-time" *ngIf="day.enabled">{{ day.openTime }} às {{ day.closeTime }}</span>
            <span class="hour-time closed" *ngIf="!day.enabled">Fechado</span>
          </div>
        </div>
      </details>

      <!-- Pagamento -->
      <div class="info-card" *ngIf="s.paymentMethods">
        <span class="info-icon">💳</span>
        <div>
          <strong>Formas de Pagamento</strong>
          <div class="payment-chips">
            <span class="chip" *ngIf="s.paymentMethods?.cash">Dinheiro</span>
            <span class="chip" *ngIf="s.paymentMethods?.pix">Pix</span>
            <span class="chip" *ngIf="s.paymentMethods?.creditCard">Cartão de Crédito</span>
            <span class="chip" *ngIf="s.paymentMethods?.debitCard">Cartão de Débito</span>
            <span class="chip" *ngIf="s.paymentMethods?.mealVoucher">Vale Refeição</span>
          </div>
        </div>
      </div>
    </section>
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

      /* Store Info */
      .store-info {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 2rem;
      }

      /* Mapa + Endereço lado a lado */
      .location-content {
        display: grid;
        grid-template-columns: 1fr 1.2fr;
        gap: 0.75rem;
        align-items: stretch;
      }

      .map-wrapper {
        border: 1px solid var(--brand-border);
        border-radius: 12px;
        overflow: hidden;
        min-height: 220px;
      }

      .map-wrapper iframe {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 220px;
        border: 0;
      }

      .location-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .loc-row, .loc-whatsapp {
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
        padding: 0.85rem 1rem;
        background: #fff;
        border: 1px solid var(--brand-border);
        border-radius: 12px;
        text-decoration: none;
        color: var(--brand-ink);
      }

      .loc-whatsapp {
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .loc-whatsapp:hover {
        border-color: #ddd;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      }

      .loc-icon {
        font-size: 1.2rem;
        line-height: 1.4;
        flex-shrink: 0;
      }

      .loc-row strong, .loc-whatsapp strong {
        display: block;
        font-size: 0.78rem;
        font-weight: 700;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        margin-bottom: 2px;
      }

      .loc-row div, .loc-whatsapp div {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
      }

      .loc-line {
        font-size: 0.88rem;
        line-height: 1.4;
        color: var(--brand-muted);
      }

      .loc-line.loc-ref {
        color: var(--brand-orange-strong, #c85a2f);
      }

      .loc-whatsapp span {
        font-size: 0.88rem;
        line-height: 1.4;
        color: var(--brand-muted);
      }

      .info-card {
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
        padding: 0.85rem 1rem;
        background: #fff;
        border: 1px solid var(--brand-border);
        border-radius: 12px;
        text-decoration: none;
        color: var(--brand-ink);
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .info-card:hover {
        border-color: #ddd;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      }

      .info-icon {
        font-size: 1.2rem;
        line-height: 1.4;
        flex-shrink: 0;
      }

      .info-card strong {
        display: block;
        font-size: 0.78rem;
        font-weight: 700;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        margin-bottom: 2px;
      }

      .info-card span {
        font-size: 0.88rem;
        line-height: 1.4;
        color: var(--brand-muted);
      }

      .info-details {
        display: block;
        padding: 0;
      }

      .info-summary {
        cursor: pointer;
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
        padding: 0.85rem 1rem;
        list-style: none;
        border-radius: 12px;
        transition: border-color 0.2s;
      }

      .info-summary::-webkit-details-marker {
        display: none;
      }

      .info-summary:hover {
        border-color: #ddd;
      }

      .hours-list {
        padding: 0.5rem 1rem 0.85rem;
        background: #fff;
        border: 1px solid var(--brand-border);
        border-top: 0;
        border-radius: 0 0 12px 12px;
      }

      .hour-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
        font-size: 0.85rem;
      }

      .hour-item + .hour-item {
        border-top: 1px solid #f0f0f0;
      }

      .hour-day { font-weight: 600; }
      .hour-time { color: var(--brand-muted); }
      .hour-time.closed { color: #d05a5a; }

      .payment-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        margin-top: 0.2rem;
      }

      .chip {
        display: inline-block;
        padding: 0.2rem 0.55rem;
        background: rgba(234, 106, 61, 0.1);
        color: var(--brand-orange-strong);
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
        white-space: nowrap;
      }

      /* Featured / Mais Pedidos */
      .featured-section {
        margin-bottom: 2rem;
      }

      .featured-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .featured-header h2 {
        margin: 0;
        font-size: 1.35rem;
      }

      .featured-link {
        font-size: 0.85rem;
        color: var(--brand-orange-strong, #c85a2f);
        text-decoration: none;
        font-weight: 600;
      }

      .featured-link:hover {
        text-decoration: underline;
      }

      .featured-carousel {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
      }

      .featured-card {
        background: #fff;
        border: 1px solid var(--brand-border);
        border-radius: 12px;
        overflow: hidden;
        transition: box-shadow 0.2s, transform 0.2s;
      }

      .featured-card:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        transform: translateY(-2px);
      }

      .featured-card-img {
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        background: #f8f8f8;
      }

      .featured-card-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .featured-card-body {
        padding: 0.75rem 1rem;
      }

      .featured-card-body h3 {
        margin: 0 0 0.25rem;
        font-size: 0.95rem;
        line-height: 1.3;
      }

      .featured-card-body p {
        margin: 0 0 0.4rem;
        font-size: 0.8rem;
        color: var(--brand-muted);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .featured-price {
        font-weight: 700;
        color: #27ae60;
        font-size: 1rem;
      }

      @media (max-width: 700px) {
        .featured-carousel {
          grid-template-columns: 1fr;
        }

        .location-content {
          grid-template-columns: 1fr;
        }
        .map-wrapper {
          min-height: 200px;
        }
        .map-wrapper iframe {
          min-height: 200px;
        }
      }
    `,
  ],
})
export class HomePageComponent implements OnInit {
  private readonly storeSettingsService = inject(StoreSettingsService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);
  private readonly menuService = inject(MenuService);
  private readonly latestStoreSettings = signal<Parameters<typeof buildStoreStatus>[0] | null>(null);

  readonly storeStatus = signal<StoreStatusSnapshot | null>(null);
  readonly storeSettings = signal<StoreSettingsResponse | null>(null);
  readonly featuredProducts = signal<FeaturedProductResponse[]>([]);

  readonly DAY_LABELS = DAY_LABELS;

  readonly mapUrl = computed<SafeResourceUrl | null>(() => {
    const p = this.storeSettings()?.storeProfile;
    if (!p?.addressStreet || !p?.addressNumber) return null;
    const q = encodeURIComponent(`${p.addressStreet}, ${p.addressNumber} - ${p.neighborhood}`);
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${q}&output=embed`,
    );
  });

  ngOnInit(): void {
    this.loadStoreStatus();
    this.watchStoreStatus();
    this.loadFeaturedProducts();
  }

  trackDay(_index: number, day: { dayOfWeek: number }): number {
    return day.dayOfWeek;
  }

  trackFeatured(_index: number, product: FeaturedProductResponse): number {
    return product.id;
  }

  private loadStoreStatus(): void {
    this.storeSettingsService.getPublicStoreSettings().subscribe({
      next: (settings) => {
        this.latestStoreSettings.set(settings);
        this.storeStatus.set(buildStoreStatus(settings));
        this.storeSettings.set(settings);
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

  private loadFeaturedProducts(): void {
    this.menuService.getFeaturedProducts().subscribe({
      next: (products) => this.featuredProducts.set(products),
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
