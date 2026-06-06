import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { OrderResponse } from '../../core/models/order.models';
import { OrdersService } from '../../core/services/orders.service';

@Component({
  selector: 'app-my-orders-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <section class="orders-page">
      <header class="page-header">
        <h1>Meus Pedidos</h1>
      </header>

      <p class="feedback" *ngIf="loading()">
        <span class="shima-loader">
          <span class="shima-loader-icon" aria-hidden="true"></span>
          Carregando pedidos...
        </span>
      </p>
      <p class="msg-error" *ngIf="errorMessage()">{{ errorMessage() }}</p>

      <p class="empty-state" *ngIf="!loading() && orders().length === 0 && !errorMessage()">
        Nenhum pedido encontrado ainda.
      </p>

      <article *ngFor="let order of orders(); trackBy: trackOrder" class="order-card">
        <div class="order-header">
          <div class="order-id-row">
            <strong>Pedido #{{ order.id }}</strong>
            <span class="status-badge" [ngClass]="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
          </div>
          <span class="order-date">{{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
        </div>

        <div class="order-summary">
          <span class="order-total">{{ order.totalPrice | currency: 'BRL' }}</span>
          <span class="order-items-count">{{ order.totalItems }} item(ns)</span>
          <span class="order-delivery" *ngIf="order.deliveryType === 'ENTREGA'">🚚 Entrega</span>
          <span class="order-delivery" *ngIf="order.deliveryType === 'RETIRADA'">🛍️ Retirada</span>
        </div>

        <ul class="order-items">
          <li *ngFor="let item of order.items">
            <span class="item-qty">{{ item.quantity }}x</span>
            <span class="item-name">{{ item.productName }}</span>
            <span class="item-price">{{ item.subtotal | currency: 'BRL' }}</span>
          </li>
        </ul>

        <div class="order-footer" *ngIf="order.deliveryAddress || order.notes || canCancel(order.status)">
          <div class="order-footer-row">
            <span *ngIf="order.deliveryAddress" class="order-address">📍 {{ order.deliveryAddress }}</span>
            <span *ngIf="order.notes" class="order-notes">📝 {{ order.notes }}</span>
          </div>
          <button
            *ngIf="canCancel(order.status)"
            type="button"
            class="btn-cancel"
            (click)="openCancelReason(order.id)"
          >
            Cancelar Pedido
          </button>
        </div>
      </article>
    </section>

    <!-- Modal de motivo de cancelamento -->
    <div class="modal-overlay" *ngIf="cancellingOrderId()" (click)="closeCancelReason()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2>Por que deseja cancelar?</h2>

        <div class="cancel-options">
          <button
            type="button"
            *ngFor="let reason of cancelReasons"
            class="cancel-reason"
            (click)="confirmCancel(reason)"
          >
            {{ reason }}
          </button>
        </div>

        <button type="button" class="btn-voltar" (click)="closeCancelReason()">Voltar</button>
      </div>
    </div>
  `,
  styles: [
    `
      .orders-page {
        animation: fadeIn 0.3s ease-in-out;
        max-width: 680px;
        margin: 0 auto;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .page-header {
        margin-bottom: 24px;
      }

      .page-header h1 {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin: 0;
      }

      .feedback {
        color: #666;
      }

      .msg-error {
        padding: 12px 16px;
        background: #fbeae5;
        color: #dc3545;
        border-radius: 8px;
        font-size: 14px;
      }

      .empty-state {
        text-align: center;
        color: #999;
        padding: 3rem 1rem;
        background: #fff;
        border-radius: 12px;
        border: 1px dashed #ddd;
      }

      .order-card {
        background: #fff;
        border: 1px solid #eee;
        border-radius: 12px;
        padding: 1rem 1.15rem;
        margin-bottom: 12px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        transition: box-shadow 0.2s;
      }

      .order-card:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      }

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.7rem;
        margin-bottom: 8px;
      }

      .order-id-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .order-id-row strong {
        font-size: 1rem;
        color: #333;
      }

      .order-date {
        font-size: 0.8rem;
        color: #999;
        white-space: nowrap;
      }

      .status-badge {
        font-size: 0.72rem;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 99px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .status-created { background: #e6f3ff; color: #007bff; }
      .status-pending-payment { background: #fff3cd; color: #856404; }
      .status-confirmed { background: #fff0e6; color: #d1682e; }
      .status-completed { background: #eaf7f0; color: #28a745; }
      .status-cancelled { background: #fbeae5; color: #dc3545; }

      .order-summary {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 10px;
        font-size: 0.85rem;
      }

      .order-total {
        font-weight: 700;
        font-size: 1.05rem;
        color: var(--brand-orange, #ea6a3d);
      }

      .order-items-count {
        color: #888;
      }

      .order-delivery {
        font-size: 0.8rem;
        color: #666;
        margin-left: auto;
      }

      .order-items {
        list-style: none;
        padding: 0;
        margin: 0;
        border-top: 1px solid #f0f0f0;
        padding-top: 8px;
      }

      .order-items li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 3px 0;
        font-size: 0.85rem;
      }

      .item-qty {
        font-weight: 600;
        color: #888;
        min-width: 28px;
      }

      .item-name {
        flex: 1;
        color: #444;
      }

      .item-price {
        color: #666;
        font-weight: 500;
      }

      .order-address,
      .order-notes {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .order-footer {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #f0f0f0;
        font-size: 0.82rem;
        color: #777;
      }

      .order-footer-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .btn-cancel {
        border: none;
        background: transparent;
        color: #dc3545;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        padding: 6px 0 0;
        align-self: flex-start;
        transition: opacity 0.2s;
      }

      .btn-cancel:hover {
        opacity: 0.7;
      }

      .status-preparing { background: #e6f3ff; color: #007bff; }
      .status-delivery { background: #fff0e6; color: #d1682e; }

      /* Modal cancelamento */
      .modal-overlay {
        position: fixed; inset: 0; z-index: 1000;
        background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        padding: 1rem;
      }

      .modal-content {
        background: #fff;
        border-radius: 14px;
        padding: 1.5rem;
        max-width: 380px;
        width: 100%;
        text-align: center;
        box-shadow: 0 12px 40px rgba(0,0,0,0.2);
        animation: fadeIn 0.15s ease;
      }

      .modal-content h2 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        color: #333;
      }

      .cancel-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 1rem;
      }

      .cancel-reason {
        border: 1px solid #eee;
        border-radius: 10px;
        background: #fafafa;
        padding: 12px 16px;
        font-size: 0.9rem;
        color: #444;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
        text-align: left;
      }

      .cancel-reason:hover {
        background: #fbeae5;
        border-color: #dc3545;
        color: #dc3545;
      }

      .btn-voltar {
        border: none;
        background: transparent;
        color: #999;
        font-size: 0.85rem;
        cursor: pointer;
        padding: 6px 0;
      }

      .btn-voltar:hover {
        color: #666;
      }
    `,
  ],
})
export class MyOrdersPageComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);

  readonly orders = signal<OrderResponse[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly cancellingOrderId = signal<number | null>(null);

  readonly cancelReasons = [
    'Mudei de ideia',
    'Demorou muito',
    'Endereço errado',
    'Vou pedir em outro lugar',
  ];

  ngOnInit(): void {
    this.ordersService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Nao foi possivel carregar o historico de pedidos.');
        this.loading.set(false);
      },
    });
  }

  trackOrder(_index: number, order: OrderResponse): number {
    return order.id;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      CREATED: 'status-created',
      PENDING_PAYMENT: 'status-pending-payment',
      CONFIRMED: 'status-confirmed',
      PREPARING: 'status-preparing',
      OUT_FOR_DELIVERY: 'status-delivery',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled',
    };
    return map[status] || 'status-created';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      CREATED: 'Criado',
      PENDING_PAYMENT: 'Pendente de Pagamento',
      CONFIRMED: 'Confirmado',
      PREPARING: 'Preparando',
      OUT_FOR_DELIVERY: 'Saiu para Entrega',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
    };
    return map[status] || status;
  }

  canCancel(status: string): boolean {
    return status === 'CREATED' || status === 'PENDING_PAYMENT' || status === 'CONFIRMED';
  }

  openCancelReason(orderId: number): void {
    this.cancellingOrderId.set(orderId);
  }

  closeCancelReason(): void {
    this.cancellingOrderId.set(null);
  }

  confirmCancel(reason: string): void {
    const orderId = this.cancellingOrderId();
    if (!orderId) return;

    this.ordersService.cancelMyOrder(orderId, reason).subscribe({
      next: () => {
        this.orders.update((list) =>
          list.map((o) =>
            o.id === orderId ? { ...o, status: 'CANCELLED' as const } : o,
          ),
        );
        this.closeCancelReason();
      },
      error: () => {
        this.errorMessage.set('Erro ao cancelar pedido. Tente novamente.');
        this.closeCancelReason();
      },
    });
  }
}
