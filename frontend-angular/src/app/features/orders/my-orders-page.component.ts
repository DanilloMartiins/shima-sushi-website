import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { OrderResponse } from '../../core/models/order.models';
import { OrdersService } from '../../core/services/orders.service';

@Component({
  selector: 'app-my-orders-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <section>
      <h1>Meus pedidos</h1>
      <p class="subtitle">Historico dos pedidos da sua conta.</p>

      <p class="feedback" *ngIf="loading()">
        <span class="shima-loader">
          <span class="shima-loader-icon" aria-hidden="true"></span>
          Carregando pedidos...
        </span>
      </p>
      <p class="feedback error" *ngIf="errorMessage()">{{ errorMessage() }}</p>

      <article *ngFor="let order of orders(); trackBy: trackOrder" class="order-card">
        <header>
          <h3>Pedido #{{ order.id }}</h3>
          <span>{{ order.status }}</span>
        </header>

        <p>
          <strong>{{ order.totalPrice | currency: 'BRL' }}</strong> - {{ order.totalItems }} itens
        </p>
        <p>{{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>

        <ul>
          <li *ngFor="let item of order.items">
            {{ item.quantity }}x {{ item.productName }}
          </li>
        </ul>
      </article>
    </section>
  `,
  styles: [
    `
      .subtitle {
        color: #cad1ee;
      }

      .feedback {
        color: #ced4ef;
      }

      .feedback.error {
        color: #ff9f9f;
      }

      .order-card {
        border: 1px solid rgba(255, 255, 255, 0.11);
        border-radius: 14px;
        background: rgba(9, 11, 18, 0.78);
        padding: 0.9rem;
        margin-bottom: 0.8rem;
      }

      .order-card header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.7rem;
      }

      .order-card h3 {
        margin: 0;
      }

      .order-card header span {
        background: rgba(249, 189, 68, 0.2);
        color: #f9cd77;
        font-size: 0.8rem;
        border-radius: 999px;
        padding: 0.2rem 0.55rem;
      }

      .order-card ul {
        margin: 0.65rem 0 0;
        padding-left: 1rem;
        color: #dae0f5;
      }
    `,
  ],
})
export class MyOrdersPageComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);

  readonly orders = signal<OrderResponse[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

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
}
