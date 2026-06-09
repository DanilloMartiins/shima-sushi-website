import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { API_BASE_URL } from '../../core/constants/api.constants';
import { ClerkService } from '../../core/services/clerk.service';

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  createdBy: string;
  abaixoDoMinimo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: number;
  type: string;
  quantity: number;
  reason: string;
  createdBy: string;
  createdAt: string;
}

const UNIDADES = ['un', 'kg', 'g', 'l', 'ml', 'cx', 'pac', 'duzia'] as const;

@Component({
  selector: 'app-admin-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h2 class="page-title">Almoxarifado</h2>

      @if (toast(); as msg) {
        <div class="toast" [class.toast--erro]="msg.tipo === 'erro'">
          {{ msg.texto }}
        </div>
      }

      <div class="toolbar">
        <button class="btn-primary" (click)="abrirForm()">+ Novo Item</button>
      </div>

      <div class="table-wrapper">
        <table class="inv-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Un</th>
              <th>Mínimo</th>
              <th>Status</th>
              <th>Cadastrado por</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (item of items; track item.id) {
              <tr [class.row-warning]="item.abaixoDoMinimo">
                <td class="cell-name">{{ item.name }}</td>
                <td class="cell-qtd">{{ item.quantity }}</td>
                <td>{{ item.unit }}</td>
                <td>{{ item.minQuantity }}</td>
                <td>
                  @if (item.abaixoDoMinimo) {
                    <span class="badge badge-warning">Abaixo do mínimo</span>
                  } @else {
                    <span class="badge badge-ok">OK</span>
                  }
                </td>
                <td>{{ item.createdBy }}</td>
                <td class="cell-actions">
                  <button class="btn-sm" (click)="editar(item)">Editar</button>
                  <button class="btn-sm btn-exit" (click)="abrirSaida(item)">Saída</button>
                  @if (isSuperAdmin) {
                    <button class="btn-sm btn-del" (click)="deletar(item)">Excluir</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>

        @if (items.length === 0) {
          <div class="empty-msg">Nenhum item cadastrado no almoxarifado.</div>
        }
      </div>
    </div>

    <!-- Modal de cadastro/edicao -->
    @if (showForm()) {
      <div class="modal-overlay" (click)="fecharForm()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>{{ formEditando() ? 'Editar' : 'Novo' }} Item</h3>

          <label>Nome do Produto</label>
          <input type="text" [(ngModel)]="formName" placeholder="Ex: Salmão fresco" />

          <div class="form-row">
            <div class="form-group">
              <label>Quantidade</label>
              <input type="number" [(ngModel)]="formQuantity" min="0" />
            </div>
            <div class="form-group">
              <label>Unidade</label>
              <select [(ngModel)]="formUnit">
                @for (u of unidades; track u) {
                  <option [value]="u">{{ u }}</option>
                }
              </select>
            </div>
          </div>

          @if (isSuperAdmin) {
            <label>Estoque Mínimo</label>
            <input type="number" [(ngModel)]="formMinQty" min="0" placeholder="0 = sem alerta" />
          }

          <div class="modal-actions">
            <button class="btn-cancel" (click)="fecharForm()">Cancelar</button>
            <button class="btn-primary" (click)="salvar()">Salvar</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal de saida -->
    @if (showExit()) {
      <div class="modal-overlay" (click)="fecharSaida()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Registrar Saída</h3>
          <p class="exit-item-name">{{ exitItem()?.name }}</p>

          <label>Quantidade</label>
          <input type="number" [(ngModel)]="exitQuantity" min="1" />

          <label>Motivo (opcional)</label>
          <input type="text" [(ngModel)]="exitReason" placeholder="Ex: produção, quebra..." />

          <div class="modal-actions">
            <button class="btn-cancel" (click)="fecharSaida()">Cancelar</button>
            <button class="btn-primary" (click)="confirmarSaida()" [disabled]="!exitQuantity || exitQuantity < 1">
              Confirmar Saída
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-container { animation: fadeIn 0.3s ease-in-out; }
    .page-title { font-size: 1.75rem; font-weight: 600; color: #1a1a2e; margin-bottom: 24px; }

    .toast {
      padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 0.9rem;
      font-weight: 500; animation: fadeIn 0.25s ease-in-out;
    }
    .toast { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .toast--erro { background: #f8d7da; color: #721c24; border-color: #f5c6cb; }

    .toolbar { margin-bottom: 16px; display: flex; gap: 8px; }

    .btn-primary {
      border: none; border-radius: 8px; padding: 8px 18px; background: #ea6a3d;
      color: #fff; font-weight: 600; font-size: 13px; cursor: pointer;
      transition: filter 0.15s;
    }
    .btn-primary:hover { filter: brightness(1.1); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-cancel {
      border: 1px solid #d0d5dd; border-radius: 8px; padding: 8px 18px;
      background: #fff; color: #333; font-weight: 500; font-size: 13px; cursor: pointer;
    }

    .btn-sm {
      border: 1px solid #d0d5dd; border-radius: 6px; padding: 4px 10px;
      background: #fff; font-size: 12px; font-weight: 500; cursor: pointer;
      transition: background 0.15s;
    }
    .btn-sm:hover { background: #f5f5f5; }
    .btn-exit { color: #e67e22; border-color: #e67e22; }
    .btn-exit:hover { background: #fef5e7; }
    .btn-del { color: #e74c3c; border-color: #e74c3c; }
    .btn-del:hover { background: #fff1f1; }

    .table-wrapper {
      background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      -webkit-overflow-scrolling: touch;
      overflow-x: auto;
    }

    .inv-table {
      width: 100%; border-collapse: collapse; font-size: 14px;
    }
    .inv-table thead { background: #f8f9fc; }
    .inv-table th {
      text-align: left; padding: 14px 16px; font-weight: 600; color: #444;
      border-bottom: 2px solid #e0e6ed; white-space: nowrap;
    }
    .inv-table td {
      padding: 12px 16px; border-bottom: 1px solid #f0f0f0; color: #333;
    }
    .inv-table tbody tr:hover { background-color: #f8faff; }
    .row-warning { background-color: #fffbf0; }

    .cell-name { font-weight: 500; }
    .cell-qtd { font-weight: 700; font-size: 1rem; }
    .cell-actions { display: flex; gap: 6px; flex-wrap: wrap; }

    .badge {
      display: inline-block; padding: 2px 8px; border-radius: 10px;
      font-size: 11px; font-weight: 600; white-space: nowrap;
    }
    .badge-ok { background: #d4edda; color: #155724; }
    .badge-warning { background: #fff3cd; color: #856404; }

    .empty-msg { padding: 40px; text-align: center; color: #888; font-style: italic; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.55);
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .modal-content {
      background: #fff; border-radius: 14px; max-width: 400px; width: 100%;
      padding: 1.5rem; box-shadow: 0 12px 40px rgba(0,0,0,0.25);
    }
    .modal-content h3 { margin: 0 0 1rem; font-size: 1.15rem; }
    .modal-content label {
      display: block; margin: 0.6rem 0 0.25rem; font-size: 0.85rem;
      font-weight: 600; color: #555;
    }
    .modal-content input, .modal-content select {
      width: 100%; padding: 8px 10px; border: 1px solid #d0d5dd;
      border-radius: 6px; font-size: 14px; box-sizing: border-box;
    }
    .form-row { display: flex; gap: 10px; }
    .form-group { flex: 1; }

    .exit-item-name { font-size: 0.95rem; color: #666; margin-bottom: 0.5rem; }

    .modal-actions {
      display: flex; gap: 8px; justify-content: flex-end; margin-top: 1.2rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class AdminInventoryPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly clerk = inject(ClerkService);

  items: InventoryItem[] = [];
  isSuperAdmin = false;

  readonly toast = signal<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

  readonly unidades = UNIDADES;

  // Form state
  readonly showForm = signal(false);
  readonly formEditando = signal(false);
  formEditId: number | null = null;
  formName = '';
  formQuantity = 0;
  formUnit = 'un';
  formMinQty = 0;

  // Exit state
  readonly showExit = signal(false);
  readonly exitItem = signal<InventoryItem | null>(null);
  exitQuantity = 1;
  exitReason = '';

  ngOnInit(): void {
    this.isSuperAdmin = this.clerk.isUserSuperAdmin();
    if (!this.isSuperAdmin) {
      this.clerk.fetchBackendRole().then((role) => {
        this.isSuperAdmin = role === 'SUPER_ADMIN';
      });
    }
    this.carregar();
  }

  carregar(): void {
    this.getToken().then((token) => {
      if (!token) return;
      this.http.get<InventoryItem[]>(`${API_BASE_URL}/admin/inventory`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      }).subscribe({
        next: (data) => { this.items = data; },
        error: () => { this.toast.set({ texto: 'Erro ao carregar inventario', tipo: 'erro' }); },
      });
    });
  }

  abrirForm(): void {
    this.formEditando.set(false);
    this.formEditId = null;
    this.formName = '';
    this.formQuantity = 0;
    this.formUnit = 'un';
    this.formMinQty = 0;
    this.showForm.set(true);
  }

  editar(item: InventoryItem): void {
    this.formEditando.set(true);
    this.formEditId = item.id;
    this.formName = item.name;
    this.formQuantity = item.quantity;
    this.formUnit = item.unit;
    this.formMinQty = item.minQuantity;
    this.showForm.set(true);
  }

  fecharForm(): void {
    this.showForm.set(false);
  }

  salvar(): void {
    if (!this.formName.trim()) {
      this.toast.set({ texto: 'Nome do produto e obrigatorio', tipo: 'erro' });
      return;
    }

    this.getToken().then((token) => {
      if (!token) return;

      const body = {
        name: this.formName.trim(),
        quantity: this.formQuantity,
        minQuantity: this.isSuperAdmin ? this.formMinQty : 0,
        unit: this.formUnit,
      };

      const url = this.formEditando()
        ? `${API_BASE_URL}/admin/inventory/${this.formEditId}`
        : `${API_BASE_URL}/admin/inventory`;

      const obs = this.formEditando()
        ? this.http.put<InventoryItem>(url, body, { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) })
        : this.http.post<InventoryItem>(url, body, { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) });

      obs.subscribe({
        next: () => {
          this.toast.set({ texto: this.formEditando() ? 'Item atualizado' : 'Item cadastrado', tipo: 'sucesso' });
          this.fecharForm();
          this.carregar();
        },
        error: (err) => {
          this.toast.set({ texto: err.error?.erro || 'Erro ao salvar', tipo: 'erro' });
        },
      });
    });
  }

  deletar(item: InventoryItem): void {
    if (!confirm(`Excluir "${item.name}" permanentemente?`)) return;

    this.getToken().then((token) => {
      if (!token) return;
      this.http.delete(`${API_BASE_URL}/admin/inventory/${item.id}`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      }).subscribe({
        next: () => {
          this.toast.set({ texto: 'Item excluido', tipo: 'sucesso' });
          this.carregar();
        },
        error: (err) => {
          this.toast.set({ texto: err.error?.erro || 'Erro ao excluir', tipo: 'erro' });
        },
      });
    });
  }

  abrirSaida(item: InventoryItem): void {
    this.exitItem.set(item);
    this.exitQuantity = 1;
    this.exitReason = '';
    this.showExit.set(true);
  }

  fecharSaida(): void {
    this.showExit.set(false);
    this.exitItem.set(null);
  }

  confirmarSaida(): void {
    const item = this.exitItem();
    if (!item || !this.exitQuantity || this.exitQuantity < 1) return;

    this.getToken().then((token) => {
      if (!token) return;

      this.http.post<InventoryItem>(
        `${API_BASE_URL}/admin/inventory/${item.id}/exit`,
        { quantity: this.exitQuantity, reason: this.exitReason.trim() || undefined },
        { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) },
      ).subscribe({
        next: () => {
          this.toast.set({ texto: 'Saida registrada', tipo: 'sucesso' });
          this.fecharSaida();
          this.carregar();
        },
        error: (err) => {
          this.toast.set({ texto: err.error?.erro || 'Erro ao registrar saida', tipo: 'erro' });
        },
      });
    });
  }

  private async getToken(): Promise<string | null> {
    return await this.clerk.getToken();
  }
}
