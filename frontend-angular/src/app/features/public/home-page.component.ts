import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { interval } from 'rxjs';

import { DAY_LABELS } from '../../core/models/store.models';
import { StoreSettingsResponse, StoreStatusSnapshot } from '../../core/models/store.models';
import { StoreSettingsService } from '../../core/services/store-settings.service';
import { MenuService } from '../../core/services/menu.service';
import { API_BASE_RAW } from '../../core/constants/api.constants';
import { ClerkService } from '../../core/services/clerk.service';
import { CartService } from '../../core/services/cart.service';
import { FeaturedProductResponse, ProductResponse } from '../../core/models/menu.models';
import { buildStoreStatus } from '../../core/utils/store-status.util';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  template: `
    <section class="status-banner" [class.open]="storeStatus()?.isOpenNow">
      <h2>{{ storeStatus()?.statusLabel ?? 'Carregando status...' }}</h2>
      <p>{{ storeStatus()?.detailLabel ?? 'Aguarde um instante.' }}</p>
    </section>

    <section class="hero-copy">
      <h1>Seu Shima Sushi</h1>
      <p>O melhor sushi de Vitória, agora com o cardápio oficial atualizado!</p>
    </section>

    <!-- Carrossel + Cards: Os Mais Pedidos -->
    <section class="featured-section" *ngIf="featuredProducts().length > 0">
      <div class="featured-header">
        <h2>Os Mais Pedidos</h2>
        <a class="featured-link" routerLink="/cardapio">Ver cardápio completo →</a>
      </div>

      <div class="featured-layout">
        <!-- Coluna 1: Slideshow -->
        <div class="featured-slideshow"
             (click)="abrirModalProduto(featuredProducts()[slideIndex()])"
             (touchstart)="onTouchStart($event)"
             (touchmove)="onTouchMove($event)"
             (touchend)="onTouchEnd($event)">
          <div class="slideshow-track">
            <img
              [src]="getImageUrl(featuredProducts()[slideIndex()].imageUrl)"
              [alt]="featuredProducts()[slideIndex()].name"
              loading="lazy"
              (error)="onSlideError()"
            />
            <div class="slideshow-overlay">
              <h3>{{ featuredProducts()[slideIndex()].name }}</h3>
              <p>{{ featuredProducts()[slideIndex()].description }}</p>
              <span class="slideshow-price">{{ featuredProducts()[slideIndex()].price | currency : 'BRL' }}</span>
            </div>
          </div>
          <div class="slideshow-dots">
            <button
              *ngFor="let p of featuredProducts(); let i = index; trackBy: trackFeatured"
              class="dot"
              [class.dot-active]="i === slideIndex()"
              (click)="$event.stopPropagation(); slideIndex.set(i)"
            ></button>
          </div>
        </div>

        <!-- Coluna 2: Cards verticais -->
        <div class="featured-cards">
          <div
            class="featured-card"
            *ngFor="let product of featuredProducts(); trackBy: trackFeatured"
            (click)="abrirModalProduto(product)"
          >
            <img
              [src]="getImageUrl(product.imageUrl)"
              [alt]="product.name"
              loading="lazy"
              (error)="onCardError(product)"
            />
            <div class="featured-card-body">
              <h3>{{ product.name }}</h3>
              <span class="featured-price">{{ product.price | currency : 'BRL' }}</span>
            </div>
          </div>
        </div>

        <!-- Coluna 3: Reservada para Promoções (futuro) -->
        <div class="featured-promo-placeholder">
          <div class="promo-placeholder-box">
            <span class="promo-icon">&#127859;</span>
            <span class="promo-text">Em breve<br/>Promoções</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal do Produto -->
    <div *ngIf="selectedProduct() as product" class="modal-overlay" (click)="fecharModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button type="button" class="modal-close" (click)="fecharModal()">&times;</button>

        <img [src]="getImageUrl(product.imageUrl)" [alt]="product.name" class="modal-image"
             (error)="onCardError(product)" />

        <div class="modal-body">
          <h2>{{ product.name }}</h2>
          <p *ngIf="product.description" class="modal-description">{{ product.description }}</p>
          <strong class="modal-price">{{ product.price | currency : 'BRL' }}</strong>

          <div class="modal-actions">
            <div class="quantity-control">
              <button type="button" (click)="diminuirQtd()" [disabled]="selectedQuantity() <= 1">-</button>
              <span class="quantity-value">{{ selectedQuantity() }}</span>
              <button type="button" (click)="aumentarQtd()">+</button>
            </div>

            <button type="button" class="btn-confirm" (click)="confirmarCarrinho()">Confirmar</button>
          </div>
        </div>
      </div>
    </div>

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

      .featured-layout {
        display: grid;
        grid-template-columns: 1.2fr 1fr 0.9fr;
        gap: 0.75rem;
        align-items: start;
      }

      /* Slideshow */
      .featured-slideshow {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        aspect-ratio: 16 / 10;
        background: #f0f0f0;
      }

      .slideshow-track {
        width: 100%;
        height: 100%;
        position: relative;
      }

      .slideshow-track img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .slideshow-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1rem 1rem 0.5rem;
        background: linear-gradient(transparent, rgba(0,0,0,0.7));
        color: #fff;
      }

      .slideshow-overlay h3 {
        margin: 0 0 0.2rem;
        font-size: 1.1rem;
      }

      .slideshow-overlay p {
        margin: 0 0 0.3rem;
        font-size: 0.8rem;
        opacity: 0.9;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .slideshow-price {
        font-weight: 700;
        font-size: 1rem;
        color: #4caf50;
      }

      .slideshow-dots {
        position: absolute;
        bottom: 0.3rem;
        right: 0.75rem;
        display: flex;
        gap: 6px;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: none;
        background: rgba(255,255,255,0.45);
        cursor: pointer;
        padding: 0;
        transition: background 0.2s;
      }

      .dot-active {
        background: #fff;
      }

      /* Cards verticais */
      .featured-cards {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .featured-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: #fff;
        border: 1px solid var(--brand-border);
        border-radius: 12px;
        padding: 0.6rem;
        cursor: pointer;
        transition: box-shadow 0.2s, transform 0.2s;
      }

      .featured-card:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        transform: translateX(3px);
      }

      .featured-card img {
        width: 72px;
        height: 72px;
        border-radius: 10px;
        object-fit: cover;
        background: #f0f0f0;
        flex-shrink: 0;
      }

      .featured-card-body {
        flex: 1;
        min-width: 0;
      }

      .featured-card-body h3 {
        margin: 0 0 0.2rem;
        font-size: 0.9rem;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .featured-price {
        font-weight: 700;
        color: #27ae60;
        font-size: 0.9rem;
      }

      /* Placeholder Promoções */
      .featured-promo-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }

      .promo-placeholder-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        width: 100%;
        height: 100%;
        min-height: 180px;
        border: 2px dashed var(--brand-border);
        border-radius: 12px;
        background: rgba(255,255,255,0.5);
      }

      .promo-icon {
        font-size: 2rem;
        opacity: 0.4;
      }

      .promo-text {
        font-size: 0.8rem;
        color: var(--brand-muted);
        text-align: center;
        line-height: 1.4;
        opacity: 0.6;
      }

      /* Modal (igual ao do cardapio) */
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

      @media (max-width: 700px) {
        .featured-layout {
          grid-template-columns: 1fr;
        }
        .featured-slideshow {
          aspect-ratio: 16 / 9;
        }
        .featured-promo-placeholder {
          display: none;
        }
        .featured-cards {
          flex-direction: row;
          -webkit-overflow-scrolling: touch;
          overflow-x: auto;
          gap: 0.5rem;
          padding-bottom: 0.5rem;
        }
        .featured-card {
          flex: 0 0 160px;
          flex-direction: column;
          padding: 0.5rem;
        }
        .featured-card img {
          width: 100%;
          height: 80px;
        }
        .modal-content { max-width: 340px; }
        .modal-image { height: 160px; }
        .modal-body { padding: 0.85rem 0.9rem 0.95rem; }
        .modal-body h2 { font-size: 1.05rem; }
        .modal-actions { gap: 0.4rem; }
        .quantity-control button { width: 30px; height: 30px; font-size: 0.9rem; }
        .btn-confirm { padding: 0.35rem 0.7rem; font-size: 0.85rem; }
      }

      @media (max-width: 380px) {
        .modal-content { max-width: 100%; margin: 0; border-radius: 0; }
        .modal-overlay { padding: 0; align-items: flex-end; }
        .modal-content { border-radius: 14px 14px 0 0; max-height: 90dvh; -webkit-overflow-scrolling: touch; overflow-y: auto; }
      }
    `,
  ],
})
export class HomePageComponent implements OnInit {
  private readonly storeSettingsService = inject(StoreSettingsService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);
  private readonly menuService = inject(MenuService);
  private readonly cartService = inject(CartService);
  private readonly clerk = inject(ClerkService);
  private readonly router = inject(Router);
  private readonly latestStoreSettings = signal<Parameters<typeof buildStoreStatus>[0] | null>(null);

  readonly storeStatus = signal<StoreStatusSnapshot | null>(null);
  readonly storeSettings = signal<StoreSettingsResponse | null>(null);
  readonly featuredProducts = signal<FeaturedProductResponse[]>([]);

  readonly slideIndex = signal(0);
  readonly selectedProduct = signal<ProductResponse | null>(null);
  readonly selectedQuantity = signal(1);

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
    this.iniciarSlideshow();
  }

  trackDay(_index: number, day: { dayOfWeek: number }): number {
    return day.dayOfWeek;
  }

  trackFeatured(_index: number, product: FeaturedProductResponse): number {
    return product.id;
  }

  private iniciarSlideshow(): void {
    interval(5000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.slideIndex.update(i => (i + 1) % this.featuredProducts().length);
      });
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

  // Touch/Swipe
  private touchStartX = 0;
  private touchEndX = 0;

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0].screenX;
  }

  onTouchMove(e: TouchEvent): void {
    this.touchEndX = e.changedTouches[0].screenX;
  }

  onTouchEnd(_e: TouchEvent): void {
    const diff = this.touchStartX - this.touchEndX;
    const total = this.featuredProducts().length;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe pra esquerda → próximo
        this.slideIndex.update(i => (i + 1) % total);
      } else {
        // Swipe pra direita → anterior
        this.slideIndex.update(i => (i - 1 + total) % total);
      }
    }
  }

  onSlideError(): void {
    const p = this.featuredProducts()[this.slideIndex()];
    if (p) {
      p.imageUrl = '/assets/images/product_placeholder.png';
    }
  }

  onCardError(product: FeaturedProductResponse | ProductResponse): void {
    product.imageUrl = '/assets/images/product_placeholder.png';
  }

  abrirModalProduto(product: FeaturedProductResponse): void {
    // Se nao estiver logado, manda pro login
    if (!this.clerk.user()) {
      void this.router.navigate(['/login']);
      return;
    }

    // Converte FeaturedProductResponse pra ProductResponse pro modal
    const productResponse: ProductResponse = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
    };
    this.selectedProduct.set(productResponse);
    this.selectedQuantity.set(1);
  }

  fecharModal(): void {
    this.selectedProduct.set(null);
  }

  aumentarQtd(): void {
    this.selectedQuantity.update(q => q + 1);
  }

  diminuirQtd(): void {
    this.selectedQuantity.update(q => Math.max(1, q - 1));
  }

  confirmarCarrinho(): void {
    const product = this.selectedProduct();
    if (product) {
      this.cartService.addProduct(product, this.selectedQuantity());
      this.fecharModal();
    }
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
