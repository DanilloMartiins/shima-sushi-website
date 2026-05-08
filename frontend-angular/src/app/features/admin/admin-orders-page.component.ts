import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { OrderResponse, OrderStatus } from '../../core/models/order.models';
import { OrdersService } from '../../core/services/orders.service';

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <article class="card">
      <h2>Gestao de pedidos</h2>

      <p *ngIf="loading()">
        <span class="shima-loader">
          <span class="shima-loader-icon" aria-hidden="true"></span>
          Carregando pedidos...
        </span>
      </p>
      <p class="error" *ngIf="errorMessage()">{{ errorMessage() }}</p>

      <div *ngFor="let order of orders(); trackBy: trackOrder" class="order-line">
        <div>
          <p class="title">Pedido #{{ order.id }} - {{ order.totalPrice | currency: 'BRL' }}</p>
          <p>
            {{ order.customerName }} - {{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }} -
            {{ order.deliveryType }}
          </p>
        </div>

        <div class="status-box">
          <select #statusSelect [value]="order.status">
            <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
          </select>
          <button type="button" (click)="updateStatus(order, statusSelect.value)">Atualizar</button>
        </div>
      </div>
    </article>
  `,
  styles: [
    `
      .card {
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 14px;
        background: rgba(9, 11, 17, 0.8);
        padding: 1rem;
      }

      .order-line {
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        padding: 0.8rem;
        margin-top: 0.7rem;
        display: flex;
        justify-content: space-between;
        gap: 0.8rem;
      }

      .title {
        margin: 0;
        font-weight: 700;
      }

      .order-line p {
        margin: 0.25rem 0 0;
      }

      .status-box {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      select {
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(7, 9, 14, 0.65);
        color: #f7f9ff;
        padding: 0.35rem 0.45rem;
      }

      button {
        border: 0;
        border-radius: 999px;
        padding: 0.4rem 0.75rem;
        background: #f9bd44;
        color: #2a2115;
        cursor: pointer;
      }

      .error {
        color: #ff9f9f;
      }

      @media (max-width: 830px) {
        .order-line {
          flex-direction: column;
        }

        .status-box {
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class AdminOrdersPageComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);

  readonly orders = signal<OrderResponse[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly statuses: OrderStatus[] = [
    'CREATED',
    'CONFIRMED',
    'PREPARING',
    'OUT_FOR_DELIVERY',
    'COMPLETED',
    'CANCELLED',
  ];

  ngOnInit(): void {
    this.refresh();
  }

  updateStatus(order: OrderResponse, nextStatus: string): void {
    if (!isOrderStatus(nextStatus) || nextStatus === order.status) {
      return;
    }

    this.ordersService.updateOrderStatus(order.id, nextStatus).subscribe({
      next: () => this.refresh(),
      error: () => this.errorMessage.set('Falha ao atualizar status do pedido.'),
    });
  }

  trackOrder(_index: number, order: OrderResponse): number {
    return order.id;
  }

  private refresh(): void {
    this.loading.set(true);
    this.ordersService.getAdminOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Nao foi possivel carregar os pedidos.');
        this.loading.set(false);
      },
    });
  }
}

function isOrderStatus(value: string): value is OrderStatus {
  return (
    value === 'CREATED' ||
    value === 'CONFIRMED' ||
    value === 'PREPARING' ||
    value === 'OUT_FOR_DELIVERY' ||
    value === 'COMPLETED' ||
    value === 'CANCELLED'
  );
}
