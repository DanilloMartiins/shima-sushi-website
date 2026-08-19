import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, interval, switchMap, takeUntil } from 'rxjs';

import { OrdersService } from '../../core/services/orders.service';
import { NotificationSoundService } from '../../core/services/notification-sound.service';
import { OrderResponse, OrderStatus } from '../../core/models/order.models';

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-page">
      <header class="page-header">
        <h1>Gerenciar Pedidos</h1>
        <button class="btn-refresh" (click)="carregarPedidos()" [disabled]="loading()">
          {{ loading() ? 'Carregando...' : 'Atualizar' }}
        </button>
      </header>

      @if (erro()) {
        <div class="erro-msg">{{ erro() }}</div>
      }

      @if (!loading() && orders().length === 0) {
        <div class="empty-state">Nenhum pedido encontrado.</div>
      }

      <div class="table-container" *ngIf="orders().length">
        <table>
          <thead>
            <tr>
              <th>ID do Pedido</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders(); let i = index">
              <td>#{{ order.id }}</td>
              <td>{{ order.customerName }}</td>
              <td>{{ order.createdAt | date : 'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ order.totalAmount | currency : 'BRL' }}</td>
              <td>
                <span class="status-badge" [ngClass]="statusClass(order.status)">
                  {{ statusLabel(order.status) }}
                </span>
              </td>
              <td class="actions">
                <button class="action-btn details-btn" (click)="toggleDetails(order.id)">
                  {{ expandedOrderId === order.id ? 'Fechar' : 'Ver Detalhes' }}
                </button>
                <button
                  *ngIf="proximoStatus(order.status)"
                  class="action-btn advance-btn"
                  (click)="onAvancar(order)"
                  [disabled]="salvando()"
                >
                  {{ labelProximoStatus(order.status) }}
                </button>
                <button
                  *ngIf="canCancel(order.status)"
                  class="action-btn cancel-btn"
                  (click)="openCancelReason(order.id)"
                >
                  Cancelar
                </button>
                <button class="action-btn print-btn" (click)="abrirImpressao(order, false)">
                  Imprimir
                </button>
              </td>
            </tr>

            <!-- Detalhes do pedido expandido -->
            <ng-container *ngIf="expandedOrderId">
              <tr class="details-row" *ngFor="let order of orders(); let i = index">
                <ng-container *ngIf="order.id === expandedOrderId">
                  <td colspan="6">
                    <div class="order-details">
                      <div class="details-section">
                        <h3>Itens do Pedido</h3>
                        <table class="items-table">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Qtd</th>
                              <th>Preço</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr *ngFor="let item of order.items">
                              <td>
                                {{ item.productName }}
                                <div *ngIf="item.customizations?.length" class="item-customizations">
                                  <div *ngFor="let c of item.customizations">
                                    + {{ c.optionName }}
                                    <span *ngIf="c.priceAddition" class="custom-price">
                                      ({{ c.priceAddition | currency : 'BRL' }})
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>{{ item.quantity }}</td>
                              <td>{{ item.unitPrice | currency : 'BRL' }}</td>
                              <td>{{ item.subtotal | currency : 'BRL' }}</td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colspan="3" class="total-label">Total</td>
                              <td class="total-value">{{ order.totalAmount | currency : 'BRL' }}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <div class="details-section">
                        <h3>Entrega & Pagamento</h3>
                        <p><strong>Tipo:</strong> {{ deliveryLabel(order.deliveryType) }}</p>
                        <p><strong>Pagamento:</strong> {{ paymentLabel(order.paymentMethod) }}</p>
                        <p *ngIf="order.paymentMethod === 'DINHEIRO' && order.changeAmount">
                          <strong>Troco para:</strong> {{ order.changeAmount | currency : 'BRL' }}
                        </p>
                        <p>
                          <strong>Endereço:</strong>
                          <span style="white-space: pre-line;">{{ order.deliveryAddress || 'Retirada no local' }}</span>
                        </p>
                        <p *ngIf="order.notes" class="order-notes">
                          <strong>Observações:</strong> {{ order.notes }}
                        </p>
                        <div *ngIf="order.status === 'CANCELLED' && order.notes" class="cancel-info">
                          <strong>Motivo do cancelamento:</strong> {{ order.notes }}
                        </div>
                      </div>
                    </div>
                  </td>
                </ng-container>
              </tr>
            </ng-container>
          </tbody>
        </table>

        <div class="load-more-wrap">
          <button class="load-more" (click)="carregarMais()">Carregar mais</button>
        </div>
      </div>
    </div>

    <!-- Modal de cancelamento (admin) - Etapa 1: escolher motivo -->
    <div class="cancel-modal-overlay" *ngIf="cancellingOrderId() && cancelStep() === 1" (click)="closeCancelReason()">
      <div class="cancel-modal" (click)="$event.stopPropagation()">
        <h2>Cancelar Pedido #{{ cancellingOrderId() }}</h2>

        <div class="cancel-options">
          <button
            type="button"
            class="cancel-option"
            (click)="selectReason('Item/Ingrediente esgotado')"
            [class.selected]="selectedReason() === 'Item/Ingrediente esgotado'"
          >
            <strong>Item/Ingrediente esgotado</strong>
            <span>O cliente pediu algo que acabou no estoque e o cardápio ainda não foi pausado.</span>
          </button>

          <button
            type="button"
            class="cancel-option"
            (click)="selectReason('Cozinha sobrecarregada (Alta demanda)')"
            [class.selected]="selectedReason() === 'Cozinha sobrecarregada (Alta demanda)'"
          >
            <strong>Cozinha sobrecarregada (Alta demanda)</strong>
            <span>O fluxo estourou e a cozinha precisa recusar novos pedidos temporariamente.</span>
          </button>

          <button
            type="button"
            class="cancel-option"
            (click)="selectReason('other')"
            [class.selected]="selectedReason() === 'other'"
          >
            <strong>Outros (Motivo específico)</strong>
            <span>Imprevisto bizarro? Digite o motivo abaixo.</span>
          </button>

          <div class="other-reason" *ngIf="selectedReason() === 'other'">
            <input
              type="text"
              [(ngModel)]="customReason"
              placeholder="Digite o motivo do cancelamento..."
              class="other-input"
            />
          </div>
        </div>

        <div class="cancel-modal-actions">
          <button type="button" class="btn-back" (click)="closeCancelReason()">Voltar</button>
          <button
            type="button"
            class="btn-confirm-cancel"
            [disabled]="!canConfirmCancel() || salvando()"
            (click)="avancarEtapa()"
          >
            {{ salvando() ? 'Cancelando...' : 'Confirmar Cancelamento' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de cancelamento (admin) - Etapa 2: previsão (só pra Cozinha Sobrecarregada) -->
    <div class="cancel-modal-overlay" *ngIf="cancellingOrderId() && cancelStep() === 2" (click)="closeCancelReason()">
      <div class="cancel-modal" (click)="$event.stopPropagation()">
        <h2>Previsão para normalizar?</h2>
        <p class="estimate-hint">Informe o tempo estimado para a cozinha voltar ao normal.</p>

        <input
          type="text"
          [(ngModel)]="estimatedTime"
          placeholder="Ex: 30 minutos, 1 hora..."
          class="estimate-input"
        />

        <div class="cancel-modal-actions">
          <button type="button" class="btn-back" (click)="voltarEtapa()">Voltar</button>
          <button
            type="button"
            class="btn-confirm-cancel"
            [disabled]="!estimatedTime.trim() || salvando()"
            (click)="confirmCancel()"
          >
            {{ salvando() ? 'Cancelando...' : 'Confirmar Cancelamento' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de impressão (cozinha + entrega) -->
    <div class="cancel-modal-overlay" *ngIf="printOrderId()" (click)="soConfirmar()">
      <div class="print-modal" (click)="$event.stopPropagation()">
        <h2>Imprimir Pedido #{{ orderAImprimir()?.id }}</h2>

        <div class="print-options">
          <button
            type="button"
            class="print-option"
            [class.selected]="printMode() === 'kitchen'"
            (click)="printMode.set('kitchen')"
          >
            <strong>Comanda Cozinha</strong>
            <span>Itens + quantidade + customizações (sem preço)</span>
          </button>
          <button
            type="button"
            class="print-option"
            [class.selected]="printMode() === 'delivery'"
            (click)="printMode.set('delivery')"
          >
            <strong>Comanda de Entrega</strong>
            <span>Itens + endereço + pagamento + troco (motoqueiro)</span>
          </button>
          <button
            type="button"
            class="print-option"
            [class.selected]="printMode() === 'both'"
            (click)="printMode.set('both')"
          >
            <strong>Ambos</strong>
            <span>Comanda da cozinha + comprovante de entrega</span>
          </button>
        </div>

        <div class="print-preview" *ngIf="orderAImprimir()">
          <div class="print-area">
            <div class="cupom" *ngIf="printMode() !== 'delivery'">
              <div class="cupom-cab">
                <div class="cupom-logo">SEU SHIMA SUSHI</div>
                <div class="cupom-titulo">COMANDA COZINHA</div>
                <div class="cupom-linha">Pedido: #{{ orderAImprimir()!.id }}</div>
                <div class="cupom-linha">Data: {{ orderAImprimir()!.createdAt | date : 'dd/MM/yyyy HH:mm' }}</div>
              </div>
              <div class="cupom-div">==============================</div>
              <div *ngFor="let item of orderAImprimir()!.items" class="cupom-item">
                <div class="cupom-item-nome">{{ item.productName.toUpperCase() }}</div>
                <div class="cupom-linha">{{ item.quantity }} UN</div>
                <div *ngFor="let c of item.customizations" class="cupom-linha">  + {{ c.optionName }}</div>
              </div>
              <div class="cupom-div">==============================</div>
              <div class="cupom-linha">Entrega: {{ deliveryLabel(orderAImprimir()!.deliveryType) }}</div>
              <div *ngIf="orderAImprimir()!.notes" class="cupom-linha">Obs: {{ orderAImprimir()!.notes }}</div>
            </div>

            <div class="cupom" *ngIf="printMode() !== 'kitchen'">
              <div class="cupom-cab">
                <div class="cupom-logo">SEU SHIMA SUSHI</div>
                <div class="cupom-titulo">COMPROVANTE DE ENTREGA</div>
                <div class="cupom-linha">Pedido: #{{ orderAImprimir()!.id }}</div>
                <div class="cupom-linha">Data: {{ orderAImprimir()!.createdAt | date : 'dd/MM/yyyy HH:mm' }}</div>
                <div class="cupom-linha">Cliente: {{ orderAImprimir()!.customerName }}</div>
              </div>
              <div class="cupom-div">==============================</div>
              <div *ngFor="let item of orderAImprimir()!.items" class="cupom-item">
                <div class="cupom-item-nome">{{ item.productName.toUpperCase() }}</div>
                <div *ngFor="let c of item.customizations" class="cupom-linha">
                  + {{ c.optionName }}<span *ngIf="c.priceAddition"> (+R$ {{ c.priceAddition | number : '1.2-2' }})</span>
                </div>
                <div class="cupom-linha">
                  {{ item.quantity }} UN x R$ {{ item.unitPrice | number : '1.2-2' }} = R$ {{ item.subtotal | number : '1.2-2' }}
                </div>
              </div>
              <div class="cupom-div">==============================</div>
              <div class="cupom-total">TOTAL: R$ {{ orderAImprimir()!.totalAmount | number : '1.2-2' }}</div>
              <div class="cupom-div">==============================</div>
              <div class="cupom-linha">Pagamento: {{ paymentLabel(orderAImprimir()!.paymentMethod) }}</div>
              <div *ngIf="orderAImprimir()!.paymentMethod === 'DINHEIRO' && orderAImprimir()!.changeAmount" class="cupom-linha">
                Troco para: R$ {{ orderAImprimir()!.changeAmount | number : '1.2-2' }}
              </div>
              <div class="cupom-linha">Entrega: {{ deliveryLabel(orderAImprimir()!.deliveryType) }}</div>
              <div *ngIf="orderAImprimir()!.deliveryAddress" class="cupom-linha">
                Endereço: {{ orderAImprimir()!.deliveryAddress }}
              </div>
              <div *ngIf="orderAImprimir()!.notes" class="cupom-linha">Obs: {{ orderAImprimir()!.notes }}</div>
              <div class="cupom-div">==============================</div>
              <div class="cupom-rodape">Obrigado pela preferencia!</div>
            </div>
          </div>
        </div>

        <div class="cancel-modal-actions">
          <button type="button" class="btn-back" (click)="soConfirmar()">
            {{ printAfterConfirm ? 'Só confirmar' : 'Fechar' }}
          </button>
          <button type="button" class="btn-confirm-print" (click)="imprimirEConfirmar()">Imprimir</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .orders-page {
        animation: fadeIn 0.3s ease-in-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .page-header h1 {
        font-size: 28px;
        font-weight: bold;
        color: #333;
      }

      .btn-refresh {
        border: 1px solid var(--brand-orange, #ea6a3d);
        background: #fff;
        color: var(--brand-orange, #ea6a3d);
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }
      .btn-refresh:hover:not(:disabled) {
        background: var(--brand-orange, #ea6a3d);
        color: #fff;
      }
      .btn-refresh:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .erro-msg {
        background: #fbeae5;
        color: #dc3545;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 0.9rem;
      }

      .empty-state {
        text-align: center;
        padding: 3rem;
        color: #888;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      .table-container {
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 16px 20px;
        text-align: left;
        border-bottom: 1px solid #f0f0f0;
      }

      thead th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #555;
      }

      tbody tr:last-child td {
        border-bottom: none;
      }

      tbody tr:hover {
        background-color: #f5f5f5;
      }

      .status-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
      }

      /* Cores para status de pedido */
      .status-completed {
        background-color: #eaf7f0;
        color: #28a745;
      }
      .status-preparing {
        background-color: #e6f3ff;
        color: #007bff;
      }
      .status-delivery {
        background-color: #fff0e6;
        color: #d1682e;
      }
      .status-pending-payment {
        background-color: #fff3cd;
        color: #856404;
      }
      .status-confirmed {
        background-color: #e8f5e9;
        color: #2e7d32;
      }
      .status-canceled {
        background-color: #fbeae5;
        color: #dc3545;
      }

      .actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .action-btn {
        border: none;
        padding: 8px 12px;
        font-size: 14px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .details-btn {
        background-color: #f0f0f0;
        color: #333;
      }
      .details-btn:hover {
        background-color: #e0e0e0;
      }

      .advance-btn {
        background-color: #e8f5e9;
        color: #2e7d32;
      }
      .advance-btn:hover:not(:disabled) {
        background-color: #c8e6c9;
      }
      .advance-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .cancel-btn {
        background-color: #fbeae5;
        color: #dc3545;
      }
      .cancel-btn:hover {
        background-color: #f5d5cc;
      }

      .load-more-wrap {
        padding: 16px;
        text-align: center;
        border-top: 1px solid #f0f0f0;
      }
      .load-more {
        border: 1px solid var(--brand-orange, #ea6a3d);
        background: #fff;
        color: var(--brand-orange, #ea6a3d);
        padding: 8px 18px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }
      .load-more:hover {
        background: var(--brand-orange, #ea6a3d);
        color: #fff;
      }

      /* Modal de cancelamento admin */
      .cancel-modal-overlay {
        position: fixed; inset: 0; z-index: 1000;
        background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        padding: 1rem;
      }

      .cancel-modal {
        background: #fff;
        border-radius: 14px;
        padding: 1.5rem;
        max-width: 420px;
        width: 100%;
        box-shadow: 0 12px 40px rgba(0,0,0,0.2);
        animation: fadeIn 0.15s ease;
      }

      .cancel-modal h2 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        color: #333;
      }

      .cancel-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 1.25rem;
      }

      .cancel-option {
        border: 1px solid #eee;
        border-radius: 10px;
        background: #fafafa;
        padding: 14px 16px;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .cancel-option:hover {
        background: #fff5f5;
        border-color: #dc3545;
      }

      .cancel-option.selected {
        background: #fbeae5;
        border-color: #dc3545;
      }

      .cancel-option strong {
        font-size: 0.9rem;
        color: #333;
      }

      .cancel-option span {
        font-size: 0.8rem;
        color: #888;
        line-height: 1.4;
      }

      .other-reason {
        margin-top: -4px;
      }

      .other-input {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 0.88rem;
        color: #333;
        background: #fff;
        box-sizing: border-box;
      }

      .other-input:focus {
        outline: none;
        border-color: var(--brand-orange, #ea6a3d);
        box-shadow: 0 0 0 3px rgba(234, 106, 61, 0.12);
      }

      .cancel-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .btn-back {
        border: none;
        background: transparent;
        color: #999;
        font-size: 0.88rem;
        cursor: pointer;
        padding: 8px 12px;
      }

      .btn-back:hover {
        color: #666;
      }

      .btn-confirm-cancel {
        border: none;
        padding: 10px 18px;
        font-size: 0.88rem;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        background: #dc3545;
        color: #fff;
        transition: background 0.2s;
      }

      .btn-confirm-cancel:hover:not(:disabled) {
        background: #c82333;
      }

      .btn-confirm-cancel:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .estimate-hint {
        font-size: 0.85rem;
        color: #888;
        margin: -0.5rem 0 1rem;
      }

      .estimate-input {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid #ddd;
        border-radius: 10px;
        font-size: 1rem;
        color: #333;
        background: #fff;
        box-sizing: border-box;
        margin-bottom: 1.25rem;
      }

      .estimate-input:focus {
        outline: none;
        border-color: var(--brand-orange, #ea6a3d);
        box-shadow: 0 0 0 3px rgba(234, 106, 61, 0.12);
      }

      /* Detalhes expandido */
      .details-row {
        background: #fafafa;
      }
      .details-row:hover {
        background: #fafafa;
      }
      .details-row td {
        padding: 0;
      }

      .order-details {
        display: flex;
        gap: 2rem;
        padding: 1.25rem 1.5rem;
        border-top: 2px solid var(--brand-orange, #ea6a3d);
        animation: fadeIn 0.2s ease;
      }

      .details-section {
        flex: 1;
      }
      .details-section h3 {
        font-size: 0.9rem;
        font-weight: 700;
        color: #333;
        margin: 0 0 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .details-section p {
        color: #555;
        font-size: 0.88rem;
        line-height: 1.5;
        margin: 0;
      }

      .order-notes {
        margin-top: 0.75rem;
        padding: 0.5rem 0.75rem;
        background: #fff8e6;
        border-radius: 6px;
        font-size: 0.85rem;
      }

      .cancel-info {
        margin-top: 0.75rem;
        padding: 0.5rem 0.75rem;
        background: #fbeae5;
        border-radius: 6px;
        font-size: 0.85rem;
        color: #dc3545;
      }

      .item-customizations {
        margin-top: 4px;
        font-size: 0.78rem;
        color: #888;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .custom-price {
        color: #2e7d32;
      }

      .items-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
      }
      .items-table th,
      .items-table td {
        padding: 6px 8px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      .items-table thead th {
        background: transparent;
        color: #888;
        font-weight: 600;
        font-size: 0.78rem;
        text-transform: uppercase;
      }
      .items-table tbody tr:last-child td {
        border-bottom: none;
      }
      .items-table tfoot td {
        border-top: 2px solid #ddd;
        font-weight: 700;
        padding-top: 8px;
      }
      .items-table .total-label {
        text-align: right;
        color: #333;
      }
      .items-table .total-value {
        color: var(--brand-orange, #ea6a3d);
      }

      .print-btn {
        background-color: #e8eaf6;
        color: #3f51b5;
      }
      .print-btn:hover {
        background-color: #c5cae9;
      }

      /* Modal de impressão */
      .print-modal {
        background: #fff;
        border-radius: 14px;
        padding: 1.5rem;
        max-width: 480px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        animation: fadeIn 0.15s ease;
      }

      .print-modal h2 {
        margin: 0 0 1rem;
        font-size: 1.1rem;
        color: #333;
      }

      .print-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 1.25rem;
      }

      .print-option {
        border: 1px solid #eee;
        border-radius: 10px;
        background: #fafafa;
        padding: 14px 16px;
        cursor: pointer;
        transition: background 0.2s, border-color 0.2s;
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .print-option:hover {
        background: #f3f2ff;
        border-color: #3f51b5;
      }

      .print-option.selected {
        background: #e8eaf6;
        border-color: #3f51b5;
      }

      .print-option strong {
        font-size: 0.9rem;
        color: #333;
      }

      .print-option span {
        font-size: 0.8rem;
        color: #888;
        line-height: 1.4;
      }

      .btn-confirm-print {
        border: none;
        padding: 10px 18px;
        font-size: 0.88rem;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        background: #3f51b5;
        color: #fff;
        transition: background 0.2s;
      }

      .btn-confirm-print:hover {
        background: #303f9f;
      }

      /* Prévia do cupom (térmica 80mm) */
      .print-preview {
        background: #f5f5f5;
        border: 1px dashed #ccc;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 1.25rem;
        overflow-x: auto;
      }

      .print-area {
        width: 80mm;
        margin: 0 auto;
        background: #fff;
        color: #000;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        line-height: 1.35;
        padding: 4mm;
      }

      .cupom + .cupom {
        margin-top: 8mm;
        padding-top: 8mm;
        border-top: 1px dashed #999;
      }

      .cupom-cab {
        text-align: center;
        margin-bottom: 4px;
      }

      .cupom-logo {
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      .cupom-titulo {
        font-size: 12px;
        font-weight: 700;
        margin: 2px 0 6px;
      }

      .cupom-div {
        text-align: center;
        white-space: pre;
        margin: 2px 0;
      }

      .cupom-linha {
        white-space: pre-wrap;
        word-break: break-word;
      }

      .cupom-item {
        margin: 6px 0;
      }

      .cupom-item-nome {
        font-weight: 700;
      }

      .cupom-total {
        font-weight: 700;
        text-align: center;
        font-size: 12px;
        margin: 2px 0;
      }

      .cupom-rodape {
        text-align: center;
        margin-top: 4px;
      }
    `,
  ],
})
export class AdminOrdersPageComponent implements OnInit, OnDestroy {
  private readonly ordersService = inject(OrdersService);
  private readonly notificationSound = inject(NotificationSoundService);
  private readonly destroy$ = new Subject<void>();

  readonly orders = signal<OrderResponse[]>([]);
  readonly loading = signal(false);
  readonly erro = signal<string | null>(null);
  readonly salvando = signal(false);

  // IDs já exibidos na tela; o polling compara contra eles pra achar pedido novo
  private readonly idsCarregados = new Set<number>();

  expandedOrderId: number | null = null;
  page = 0;

  readonly cancellingOrderId = signal<number | null>(null);
  readonly selectedReason = signal<string | null>(null);
  readonly cancelStep = signal(1);
  customReason = '';
  estimatedTime = '';

  readonly printOrderId = signal<number | null>(null);
  readonly printMode = signal<'kitchen' | 'delivery' | 'both'>('both');
  printAfterConfirm = false;

  readonly orderAImprimir = computed<OrderResponse | null>(() => {
    const id = this.printOrderId();
    return id ? this.orders().find((o) => o.id === id) ?? null : null;
  });

  ngOnInit(): void {
    this.carregarPedidos();
    this.iniciarPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarPedidos(): void {
    this.loading.set(true);
    this.erro.set(null);

    this.ordersService.getAdminOrders(0, 20).subscribe({
      next: (res) => {
        this.orders.set(res.content);
        this.page = 0;
        this.marcarIdsCarregados(res.content);
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Erro ao carregar pedidos. Tente novamente.');
        this.loading.set(false);
      },
    });
  }

  // Busca a página atual a cada 20s. Se aparecer um id que não existia antes,
  // toca o bip (pedido novo chegou). A primeira carga é feita pelo carregarPedidos,
  // então o polling nunca bipa pedido que já está na tela.
  private iniciarPolling(): void {
    interval(20000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.ordersService.getAdminOrders(0, 20)),
      )
      .subscribe({
        next: (res) => {
          const idsNovos = res.content
            .map((o) => o.id)
            .filter((id) => !this.idsCarregados.has(id));

          // Atualiza a lista mesmo sem pedido novo (reflete mudança de status)
          this.orders.set(res.content);
          this.marcarIdsCarregados(res.content);

          if (idsNovos.length > 0) {
            this.notificationSound.pedidoNovo();
          }
        },
        error: () => {
          // Silencioso: se a API falhar, a página continua com o que tem
        },
      });
  }

  private marcarIdsCarregados(lista: OrderResponse[]): void {
    this.idsCarregados.clear();
    lista.forEach((o) => this.idsCarregados.add(o.id));
  }

  carregarMais(): void {
    this.ordersService.getAdminOrders(this.page + 1, 20).subscribe({
      next: (res) => {
        this.orders.update((lista) => [...lista, ...res.content]);
        this.page += 1;
        res.content.forEach((o) => this.idsCarregados.add(o.id));
      },
      error: () => {
        this.erro.set('Erro ao carregar mais pedidos.');
      },
    });
  }

  statusLabel(status: OrderStatus): string {
    switch (status) {
      case 'PENDING_PAYMENT': return 'Pendente de Pagamento';
      case 'CONFIRMED': return 'Confirmado';
      case 'PREPARING': return 'Em Preparo';
      case 'OUT_FOR_DELIVERY': return 'Saiu para Entrega';
      case 'COMPLETED': return 'Concluído';
      case 'CANCELLED': return 'Cancelado';
      default: return status;
    }
  }

  statusClass(status: OrderStatus): string {
    switch (status) {
      case 'PENDING_PAYMENT': return 'status-pending-payment';
      case 'CONFIRMED': return 'status-confirmed';
      case 'PREPARING': return 'status-preparing';
      case 'OUT_FOR_DELIVERY': return 'status-delivery';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-canceled';
      default: return '';
    }
  }

  proximoStatus(status: OrderStatus): OrderStatus | null {
    switch (status) {
      case 'PENDING_PAYMENT': return 'CONFIRMED';
      case 'CONFIRMED': return 'PREPARING';
      case 'PREPARING': return 'OUT_FOR_DELIVERY';
      case 'OUT_FOR_DELIVERY': return 'COMPLETED';
      default: return null;
    }
  }

  labelProximoStatus(status: OrderStatus): string {
    switch (status) {
      case 'PENDING_PAYMENT': return 'Confirmar Pagamento';
      case 'CONFIRMED': return 'Iniciar Preparo';
      case 'PREPARING': return 'Sair para Entrega';
      case 'OUT_FOR_DELIVERY': return 'Concluir Pedido';
      default: return '';
    }
  }

  canCancel(status: OrderStatus): boolean {
    return (
      status === 'PENDING_PAYMENT' ||
      status === 'CONFIRMED' ||
      status === 'PREPARING' ||
      status === 'OUT_FOR_DELIVERY'
    );
  }

  avancarStatus(order: OrderResponse): void {
    const next = this.proximoStatus(order.status);
    if (!next || this.salvando()) return;

    this.salvando.set(true);
    this.erro.set(null);
    this.ordersService.updateOrderStatus(order.id, next).subscribe({
      next: () => {
        this.salvando.set(false);
        this.carregarPedidos();
      },
      error: () => {
        this.salvando.set(false);
        this.erro.set('Erro ao alterar o status do pedido.');
      },
    });
  }

  // Confirmar pagamento abre o modal de impressão; os outros status avançam direto
  onAvancar(order: OrderResponse): void {
    const next = this.proximoStatus(order.status);
    if (!next || this.salvando()) return;

    if (next === 'CONFIRMED') {
      this.abrirImpressao(order, true);
    } else {
      this.avancarStatus(order);
    }
  }

  abrirImpressao(order: OrderResponse, afterConfirm: boolean): void {
    this.printOrderId.set(order.id);
    this.printMode.set('both');
    this.printAfterConfirm = afterConfirm;
  }

  // Fecha o modal sem imprimir; se for fluxo de confirmar pagamento, avança o status
  soConfirmar(): void {
    const order = this.orderAImprimir();
    const after = this.printAfterConfirm;
    this.printOrderId.set(null);
    if (after && order) {
      this.avancarStatus(order);
    }
  }

  // window.print() é bloqueante no Chrome (fica na prévia até confirmar),
  // então o modal continua aberto enquanto imprime e fecha depois
  imprimirEConfirmar(): void {
    const order = this.orderAImprimir();
    if (!order) return;

    const after = this.printAfterConfirm;
    window.print();
    this.printOrderId.set(null);
    if (after) {
      this.avancarStatus(order);
    }
  }

  toggleDetails(orderId: number): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  openCancelReason(orderId: number): void {
    this.cancellingOrderId.set(orderId);
    this.selectedReason.set(null);
    this.cancelStep.set(1);
    this.customReason = '';
    this.estimatedTime = '';
  }

  closeCancelReason(): void {
    this.cancellingOrderId.set(null);
  }

  selectReason(reason: string): void {
    this.selectedReason.set(reason);
  }

  canConfirmCancel(): boolean {
    const r = this.selectedReason();
    if (!r) return false;
    if (r === 'other') return this.customReason.trim().length > 0;
    return true;
  }

  avancarEtapa(): void {
    const r = this.selectedReason();
    if (!r) return;

    // Se for "Cozinha sobrecarregada", vai pra etapa 2 (previsão)
    if (r === 'Cozinha sobrecarregada (Alta demanda)') {
      this.cancelStep.set(2);
      return;
    }

    // Senão, já confirma direto
    this.confirmCancel();
  }

  voltarEtapa(): void {
    this.cancelStep.set(1);
  }

  confirmCancel(): void {
    const orderId = this.cancellingOrderId();
    if (!orderId || this.salvando()) return;

    let reason = '';
    const r = this.selectedReason();

    if (r === 'other') {
      reason = 'Cancelado: ' + this.customReason.trim();
    } else if (r === 'Cozinha sobrecarregada (Alta demanda)') {
      reason = 'Cancelado: Cozinha sobrecarregada. Previsão para normalizar: ' + this.estimatedTime.trim();
    } else {
      reason = 'Cancelado: ' + r;
    }

    if (!reason) return;

    this.salvando.set(true);
    this.erro.set(null);
    this.ordersService.updateOrderStatus(orderId, 'CANCELLED', reason).subscribe({
      next: () => {
        this.salvando.set(false);
        this.closeCancelReason();
        this.carregarPedidos();
      },
      error: () => {
        this.salvando.set(false);
        this.erro.set('Erro ao cancelar o pedido.');
      },
    });
  }

  paymentLabel(method: string): string {
    switch (method) {
      case 'PIX': return 'Pix';
      case 'CARTAO_CREDITO': return 'Cartão de Crédito';
      case 'DINHEIRO': return 'Dinheiro';
      default: return method;
    }
  }

  deliveryLabel(type: string): string {
    switch (type) {
      case 'ENTREGA': return 'Entrega';
      case 'RETIRADA': return 'Retirada no local';
      default: return type;
    }
  }
}