import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { timer } from 'rxjs';

import { OrdersService } from '../../core/services/orders.service';
import { OrderResponse, OrderStatus } from '../../core/models/order.models';

@Component({
  selector: 'app-order-status-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="status-wrap">
      <div class="status-card">
        <div class="status-header">
          <h1>Pedido #{{ orderId }}</h1>
          <span class="status-badge" [class]="'badge-' + (status().toLowerCase().replace('_', '-'))">
            {{ statusLabel() }}
          </span>
        </div>

        <!-- Timeline de status -->
        <div class="timeline">
          <div class="step" [class.done]="order() !== null" [class.current]="status() === 'PENDING_PAYMENT' || status() === 'CREATED'">
            <span class="step-icon">{{ order() !== null ? '&#10003;' : '1' }}</span>
            <div class="step-info">
              <strong>Pedido Recebido</strong>
              <span>{{ order()?.createdAt | date:'short' }}</span>
            </div>
          </div>

          <div class="step"
            [class.done]="status() === 'CONFIRMED' || status() === 'PREPARING' || status() === 'OUT_FOR_DELIVERY' || status() === 'COMPLETED'"
            [class.current]="status() === 'CONFIRMED'"
            [class.cancelled]="status() === 'CANCELLED'">
            <span class="step-icon">
              {{ status() === 'CANCELLED' ? '&#10007;' : (status() === 'CONFIRMED' || status() === 'PREPARING' || status() === 'OUT_FOR_DELIVERY' || status() === 'COMPLETED' ? '&#10003;' : '2') }}
            </span>
            <div class="step-info">
              <strong>{{ status() === 'CANCELLED' ? 'Cancelado' : 'Confirmado' }}</strong>
              <span *ngIf="status() === 'CONFIRMED'">Pagamento aprovado</span>
              <span *ngIf="status() === 'CANCELLED'">Pedido cancelado</span>
            </div>
          </div>

          <div class="step"
            [class.done]="status() === 'PREPARING' || status() === 'OUT_FOR_DELIVERY' || status() === 'COMPLETED'"
            [class.current]="status() === 'PREPARING'"
            [class.cancelled]="status() === 'CANCELLED'">
            <span class="step-icon">
              {{ status() === 'CANCELLED' ? '&#10007;' : (status() === 'PREPARING' || status() === 'OUT_FOR_DELIVERY' || status() === 'COMPLETED' ? '&#10003;' : '3') }}
            </span>
            <div class="step-info">
              <strong>Preparando</strong>
              <span *ngIf="status() === 'PREPARING'">Seu pedido está sendo preparado</span>
            </div>
          </div>

          <div class="step"
            [class.done]="status() === 'OUT_FOR_DELIVERY' || status() === 'COMPLETED'"
            [class.current]="status() === 'OUT_FOR_DELIVERY'"
            [class.cancelled]="status() === 'CANCELLED'">
            <span class="step-icon">
              {{ status() === 'CANCELLED' ? '&#10007;' : (status() === 'OUT_FOR_DELIVERY' || status() === 'COMPLETED' ? '&#10003;' : '4') }}
            </span>
            <div class="step-info">
              <strong>Saiu pra Entrega</strong>
              <span *ngIf="status() === 'OUT_FOR_DELIVERY'">Pedido a caminho</span>
            </div>
          </div>

          <div class="step"
            [class.done]="status() === 'COMPLETED'"
            [class.current]="status() === 'COMPLETED'"
            [class.cancelled]="status() === 'CANCELLED'">
            <span class="step-icon">
              {{ status() === 'CANCELLED' ? '&#10007;' : (status() === 'COMPLETED' ? '&#10003;' : '5') }}
            </span>
            <div class="step-info">
              <strong>Entregue</strong>
              <span *ngIf="status() === 'COMPLETED'">Pedido finalizado com sucesso!</span>
            </div>
          </div>
        </div>

        <!-- Detalhes do pedido -->
        <div class="status-details" *ngIf="order()">
          <div class="detail-row">
            <span>Forma de Pagamento</span>
            <strong>{{ paymentLabel(order()!.paymentMethod) }}</strong>
          </div>
          <div class="detail-row" *ngIf="order()!.deliveryAddress">
            <span>Endereço de Entrega</span>
            <strong>{{ order()!.deliveryAddress }}</strong>
          </div>
          <div class="detail-row">
            <span>Total</span>
            <strong class="total-price">{{ order()!.totalPrice | currency:'BRL' }}</strong>
          </div>
        </div>

        <!-- Ações -->
        <div class="status-actions">
          <a routerLink="/orders" class="btn-back">Voltar pra Meus Pedidos</a>
        </div>

        <!-- Indicadores de status -->
        <p class="status-hint" *ngIf="!isFinalStatus() && !connectionError()">
          Atualizando automaticamente a cada 3 segundos...
        </p>
        <p class="status-hint error" *ngIf="connectionError() && !isFinalStatus()">
          Conexão instável, tentando atualizar...
        </p>
        <p class="status-hint done" *ngIf="isFinalStatus()">
          Finalizado. O acompanhamento automático foi encerrado.
        </p>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      background: #fcfcfc;
      min-height: 100dvh;
      padding: 3rem 1rem;
    }

    .status-wrap {
      width: min(720px, 100%);
      margin: 0 auto;
    }

    .status-card {
      background: #fff;
      border-radius: 24px;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 8px 32px rgba(0,0,0,0.04);
      padding: 2.5rem;
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .status-header h1 {
      font-size: 1.8rem;
      color: var(--brand-ink);
      margin: 0;
    }

    .status-badge {
      padding: 0.4rem 0.9rem;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-created,
    .badge-pending_payment {
      background: #fff3e0;
      color: #e65100;
    }
    .badge-confirmed {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .badge-preparing {
      background: #e3f2fd;
      color: #1565c0;
    }
    .badge-out_for_delivery {
      background: #fce4ec;
      color: #d1682e;
    }
    .badge-completed {
      background: #e8f5e9;
      color: #1b5e20;
    }
    .badge-cancelled {
      background: #ffebee;
      color: #c62828;
    }

    .timeline {
      display: grid;
      gap: 1rem;
      padding: 1.5rem 0;
      border-top: 1px solid #f0f0f0;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 1.5rem;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 1rem;
      opacity: 0.4;
      transition: opacity 0.4s ease;
    }
    .step.done {
      opacity: 1;
    }
    .step.current {
      opacity: 1;
    }
    .step.current .step-icon {
      background: var(--brand-orange);
      box-shadow: 0 0 0 4px rgba(234, 106, 61, 0.2);
    }
    .step.cancelled .step-icon {
      background: #c62828;
    }
    .step.cancelled {
      opacity: 1;
    }

    .step-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e0e0e0;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }
    .step.done .step-icon {
      background: #2e7d32;
    }

    .step-info strong {
      display: block;
      font-size: 1rem;
      color: var(--brand-ink);
    }
    .step-info span {
      font-size: 0.85rem;
      color: #666;
    }

    .status-details {
      display: grid;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.95rem;
    }
    .detail-row span {
      color: #666;
    }
    .detail-row strong {
      color: var(--brand-ink);
    }
    .total-price {
      font-size: 1.4rem;
      color: var(--brand-orange-strong) !important;
      font-weight: 800;
    }

    .status-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-back {
      display: inline-block;
      background: var(--brand-ink);
      color: #fff;
      text-decoration: none;
      padding: 0.35rem 0.8rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      line-height: 1.35;
      transition: all 0.2s;
    }
    .btn-back:hover {
      filter: brightness(1.2);
    }

    .status-hint {
      margin-top: 1.5rem;
      font-size: 0.8rem;
      color: #aaa;
      text-align: center;
      animation: pulse 2s ease-in-out infinite;
    }
    .status-hint.done {
      color: #2e7d32;
      animation: none;
    }
    .status-hint.error {
      color: #d1682e;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
  `],
})
export class OrderStatusPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersService = inject(OrdersService);
  private readonly destroyRef = inject(DestroyRef);

  readonly orderId = signal<number>(0);
  readonly order = signal<OrderResponse | null>(null);
  readonly status = signal<OrderStatus>('PENDING_PAYMENT');
  readonly connectionError = signal(false);

  statusLabel(): string {
    const labels: Record<string, string> = {
      CREATED: 'Criado',
      PENDING_PAYMENT: 'Aguardando Pagamento',
      CONFIRMED: 'Confirmado',
      PREPARING: 'Preparando',
      OUT_FOR_DELIVERY: 'Saiu pra Entrega',
      COMPLETED: 'Entregue',
      CANCELLED: 'Cancelado',
    };
    return labels[this.status()] || this.status();
  }

  paymentLabel(method: string): string {
    const labels: Record<string, string> = {
      PIX: 'PIX',
      CARTAO_CREDITO: 'Cartão de Crédito',
      DINHEIRO: 'Dinheiro',
    };
    return labels[method] || method;
  }

  isFinalStatus(): boolean {
    return this.status() === 'COMPLETED' || this.status() === 'CANCELLED';
  }

  ngOnInit(): void {
    // Pega o id do pedido pela rota
    const orderIdParam = this.route.snapshot.paramMap.get('id');
    if (!orderIdParam) return;

    const id = Number(orderIdParam);
    this.orderId.set(id);

    // Já mostra "Aguardando Pagamento" antes mesmo do polling buscar no backend
    this.status.set('PENDING_PAYMENT');

    // Inicia o polling com takeUntilDestroyed pra nao vazar memoria
    // Quando o componente for destruido, o observable morre junto
    this.ordersService.watchPedidoStatus(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result === null) {
            // Se veio null é porque a API falhou
            this.connectionError.set(true);

            // Mostra a mensagem de erro por 4 segundos e depois some
            timer(4000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
              this.connectionError.set(false);
            });
            return;
          }

          // Reseta o aviso de conexao quando chegar resposta
          this.connectionError.set(false);

          this.order.set(result);
          this.status.set(result.status);
        },
        error: () => {
          console.warn(`Polling do pedido ${id} encerrado com erro`);
        },
      });
  }
}
