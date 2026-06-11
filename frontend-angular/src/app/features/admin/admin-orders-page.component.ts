import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Order {
  id: string;
  customerName: string;
  date: Date;
  totalValue: number;
  status: 'Pendente de Pagamento' | 'Concluído' | 'Em Preparo' | 'Saiu para Entrega' | 'Cancelado';
  items: { name: string; qty: number; price: number }[];
  address: string;
  notes?: string;
}

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-page">
      <header class="page-header">
        <h1>Relatório de Pedidos</h1>
      </header>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID do Pedido</th>
              <th>Nome do Cliente</th>
              <th>Data</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders; let i = index">
              <td>#{{ order.id.slice(0, 6) }}...</td>
              <td>{{ order.customerName }}</td>
              <td>{{ order.date | date : 'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ order.totalValue | currency : 'BRL' }}</td>
              <td>
                <span
                  class="status-badge"
                  [ngClass]="{
                    'status-pending-payment': order.status === 'Pendente de Pagamento',
                    'status-completed': order.status === 'Concluído',
                    'status-preparing': order.status === 'Em Preparo',
                    'status-delivery': order.status === 'Saiu para Entrega',
                    'status-canceled': order.status === 'Cancelado'
                  }"
                  >{{ order.status }}</span
                >
              </td>
              <td class="actions">
                <button class="action-btn details-btn" (click)="toggleDetails(order.id)">
                  {{ expandedOrderId === order.id ? 'Fechar' : 'Ver Detalhes' }}
                </button>
                <button
                  *ngIf="canCancel(order.status)"
                  class="action-btn cancel-btn"
                  (click)="openCancelReason(order.id)"
                >
                  Cancelar
                </button>
              </td>
            </tr>

            <!-- Detalhes do pedido expandido -->
            <ng-container *ngIf="expandedOrderId">
              <tr class="details-row" *ngFor="let order of orders; let i = index">
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
                              <td>{{ item.name }}</td>
                              <td>{{ item.qty }}</td>
                              <td>{{ item.price | currency : 'BRL' }}</td>
                              <td>{{ item.qty * item.price | currency : 'BRL' }}</td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colspan="3" class="total-label">Total</td>
                              <td class="total-value">{{ order.totalValue | currency : 'BRL' }}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <div class="details-section">
                        <h3>Endereço de Entrega</h3>
                        <p>{{ order.address }}</p>
                        <p *ngIf="order.notes" class="order-notes">
                          <strong>Observações:</strong> {{ order.notes }}
                        </p>
                        <div *ngIf="order.status === 'Cancelado' && order.notes" class="cancel-info">
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
      </div>
    </div>

    <!-- Modal de cancelamento (admin) - Etapa 1: escolher motivo -->
    <div class="cancel-modal-overlay" *ngIf="cancellingOrderId() && cancelStep() === 1" (click)="closeCancelReason()">
      <div class="cancel-modal" (click)="$event.stopPropagation()">
        <h2>Cancelar Pedido #{{ cancellingOrderId()?.slice(0, 6) }}</h2>

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
            [disabled]="!canConfirmCancel()"
            (click)="avancarEtapa()"
          >
            Confirmar Cancelamento
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
            [disabled]="!estimatedTime.trim()"
            (click)="confirmCancel()"
          >
            Confirmar Cancelamento
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    // Reutilizando os mesmos estilos do AdminProductsPageComponent para consistência
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
      .status-canceled {
        background-color: #fbeae5;
        color: #dc3545;
      }

      .actions {
        display: flex;
        gap: 10px;
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

      .cancel-btn {
        background-color: #fbeae5;
        color: #dc3545;
      }
      .cancel-btn:hover {
        background-color: #f5d5cc;
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
    `,
  ],
})
export class AdminOrdersPageComponent {
  expandedOrderId: string | null = null;

  readonly cancellingOrderId = signal<string | null>(null);
  readonly selectedReason = signal<string | null>(null);
  readonly cancelStep = signal(1);
  customReason = '';
  estimatedTime = '';

  toggleDetails(orderId: string): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  canCancel(status: string): boolean {
    return status === 'Em Preparo' || status === 'Saiu para Entrega';
  }
  // Nota: 'Pendente de Pagamento' é gerenciado pelo scheduler,
  // que cancela automaticamente após 10 minutos sem confirmação.

  openCancelReason(orderId: string): void {
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
    if (!orderId) return;

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

    // Atualiza localmente (mock) — quando tiver backend real, chama a API
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = 'Cancelado';
      order.notes = reason;
    }

    this.closeCancelReason();
  }

  orders: Order[] = [
    {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      customerName: 'Carlos Silva',
      date: new Date(2026, 4, 21, 19, 30),
      totalValue: 97.5,
      status: 'Em Preparo',
      items: [
        { name: 'Combinado Salmão (20 peças)', qty: 1, price: 62.0 },
        { name: 'Hot Roll Filadélfia (8 peças)', qty: 2, price: 17.75 },
      ],
      address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
      notes: 'Sem cebola, por favor',
    },
    {
      id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345',
      customerName: 'Pedro Almeida',
      date: new Date(2026, 4, 21, 19, 30),
      totalValue: 85.0,
      status: 'Pendente de Pagamento',
      items: [
        { name: 'Combinado Especial (30 peças)', qty: 1, price: 65.0 },
        { name: 'Temaki Hot', qty: 1, price: 20.0 },
      ],
      address: 'Rua Sete de Setembro, 300 - Centro, Vitória - ES',
      notes: 'Pagamento via Pix aguardando confirmação',
    },
    {
      id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
      customerName: 'Mariana Oliveira',
      date: new Date(2026, 4, 21, 19, 15),
      totalValue: 120.0,
      status: 'Saiu para Entrega',
      items: [
        { name: 'Sashimi Salmão (15 fatias)', qty: 1, price: 45.0 },
        { name: 'Temaki Salmão', qty: 2, price: 28.5 },
        { name: 'Jōgo de Chá', qty: 2, price: 9.0 },
      ],
      address: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
    },
    {
      id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef2',
      customerName: 'João Pereira',
      date: new Date(2026, 4, 20, 20, 0),
      totalValue: 75.0,
      status: 'Concluído',
      items: [
        { name: 'Uramaki Filadélfia (12 peças)', qty: 1, price: 38.0 },
        { name: 'Sunomono', qty: 1, price: 22.0 },
        { name: 'H2O Limão 500ml', qty: 1, price: 15.0 },
      ],
      address: 'Rua Augusta, 500 - Consolação, São Paulo - SP',
    },
    {
      id: 'd4e5f6a7-b8c9-0123-4567-890abcdef3',
      customerName: 'Ana Costa',
      date: new Date(2026, 4, 20, 18, 45),
      totalValue: 55.5,
      status: 'Concluído',
      items: [
        { name: 'Hot Roll Filadélfia (8 peças)', qty: 3, price: 17.75 },
      ],
      address: 'Rua Oscar Freire, 800 - Jardins, São Paulo - SP',
      notes: 'Tocar interfone 2 vezes',
    },
    {
      id: 'e5f6a7b8-c9d0-1234-5678-90abcdef4',
      customerName: 'Lucas Souza',
      date: new Date(2026, 4, 19, 21, 10),
      totalValue: 42.0,
      status: 'Cancelado',
      items: [
        { name: 'Combinado Especial (32 peças)', qty: 1, price: 42.0 },
      ],
      address: 'Rua da Consolação, 2500 - Consolação, São Paulo - SP',
    },
  ];
}
