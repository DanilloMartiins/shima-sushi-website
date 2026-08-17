import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ClerkService } from '../../core/services/clerk.service';
import { API_BASE_URL } from '../../core/constants/api.constants';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  clerkId: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

interface OpcaoRole {
  value: string;
  label: string;
}

interface LoyaltyTransaction {
  id: number;
  type: string;
  orderId: number | null;
  description: string;
  createdAt: string;
}

interface LoyaltyCard {
  id: number;
  stamps: number;
  stampsNeeded: number;
  prizeDescription: string;
  transactions: LoyaltyTransaction[];
}

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2 class="page-title">Gerenciar Usuários</h2>

      @if (toast()) {
        <div class="toast" [class.toast--erro]="toast()?.tipo === 'erro'">
          {{ toast()?.texto }}
        </div>
      }

      <div class="toolbar">
        <div class="search-box">
          <input
            type="text"
            class="search-input"
            placeholder="Buscar por nome..."
            (input)="onBuscaInput($event)"
          />
        </div>
        @if (isSuperAdmin) {
          <button class="btn-sync" (click)="syncClerk()" [disabled]="syncing()">
            {{ syncing() ? 'Sincronizando...' : 'Sincronizar Nomes do Clerk' }}
          </button>
        }
      </div>

      <div class="table-wrapper">
        <table class="user-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Role</th>
              <th>Cargo</th>
              <th>Clerk ID</th>
            </tr>
          </thead>
          <tbody>
            @for (user of usuariosFiltrados; track user.id) {
              <tr
                class="user-row"
                [class.user-row--selected]="clienteSelecionado()?.clerkId === user.clerkId"
                (click)="selecionarCliente(user)"
              >
                <td class="cell-name">{{ nomeExibicao(user) }}</td>
                <td class="cell-email">{{ emailExibicao(user) }}</td>
                <td>
                  <span
                    class="role-badge"
                    [class.role-super-admin]="user.role === 'SUPER_ADMIN'"
                    [class.role-admin]="user.role === 'ADMIN'"
                    [class.role-customer]="user.role === 'CUSTOMER'"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="cell-actions">
                  <select
                    class="role-select"
                    [disabled]="!isSuperAdmin"
                    (change)="onRoleChange(user, $event)"
                    (click)="$event.stopPropagation()"
                  >
                    @for (opcao of opcoesPorRole(user.role); track opcao.value) {
                      <option [value]="opcao.value" [selected]="opcao.value === user.role">
                        {{ opcao.label }}
                      </option>
                    }
                  </select>
                </td>
                <td class="cell-clerk-id">{{ user.clerkId || '-' }}</td>
              </tr>
              @if (clienteSelecionado()?.clerkId === user.clerkId && user.role === 'CUSTOMER') {
                <tr class="detail-row">
                  <td colspan="5">
                    <div class="customer-detail">
                      <div class="detail-section">
                        <strong>Telefone:</strong>
                        <span>{{ user.phone || 'Não informado' }}</span>
                      </div>

                      @if (loyaltyCard()) {
                        <div class="detail-section loyalty-section">
                          <strong>Cartão Fidelidade</strong>
                          <div class="stamps-bar">
                            @for (stamp of gerarSelos(loyaltyCard()!); track $index) {
                              <div
                                class="stamp"
                                [class.stamp--filled]="stamp.preenchido"
                                [class.stamp--empty]="!stamp.preenchido"
                                [title]="stamp.tooltip"
                              >
                                <span class="stamp-icon stamp-shima-icon" [class.shima-icon--empty]="!stamp.preenchido" aria-hidden="true"></span>
                                @if (stamp.tooltip) {
                                  <div class="stamp-tooltip">
                                    <div class="tooltip-order-id">Pedido #{{ stamp.transaction?.orderId }}</div>
                                    <div class="tooltip-status">Concluído</div>
                                    <div class="tooltip-date">{{ stamp.transaction?.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
                                  </div>
                                }
                              </div>
                            }
                          </div>
                          <div class="stamps-info">
                            {{ loyaltyCard()!.stamps }}/{{ loyaltyCard()!.stampsNeeded }} selos
                            &mdash; Prêmio: {{ loyaltyCard()!.prizeDescription }}
                          </div>
                        </div>
                      } @else {
                        <div class="detail-section">
                          <em>Cliente ainda não possui cartão fidelidade.</em>
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      @if (!isSuperAdmin) {
        <p class="restricted-msg">Apenas SUPER_ADMIN pode alterar cargos.</p>
      }
    </div>
  `,
  styles: [`
    .page-container {
      animation: fadeIn 0.3s ease-in-out;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 24px;
    }

    .toast {
      padding: 10px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 0.9rem;
      font-weight: 500;
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      animation: fadeIn 0.25s ease-in-out;
    }

    .toast--erro {
      background: #f8d7da;
      color: #721c24;
      border-color: #f5c6cb;
    }

    .table-wrapper {
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      -webkit-overflow-scrolling: touch;
      overflow-x: auto;
    }

    .user-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .user-table thead {
      background: #f8f9fc;
    }

    .user-table th {
      text-align: left;
      padding: 14px 16px;
      font-weight: 600;
      color: #444;
      border-bottom: 2px solid #e0e6ed;
      white-space: nowrap;
    }

    .user-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      color: #333;
    }

    .user-table tbody tr:hover {
      background-color: #f8faff;
    }

    .cell-name {
      font-weight: 500;
    }

    .cell-email {
      color: #666;
    }

    .cell-clerk-id {
      font-family: monospace;
      font-size: 12px;
      color: #888;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .role-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .role-super-admin {
      background: #fff3cd;
      color: #856404;
    }

    .role-admin {
      background: #d4edda;
      color: #155724;
    }

    .role-customer {
      background: #e9ecef;
      color: #495057;
    }

    .cell-actions {
      min-width: 120px;
    }

    .role-select {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid #d0d5dd;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      background: #fff;
      color: #333;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
      appearance: auto;
    }

    .role-select:focus {
      outline: none;
      border-color: #ea6a3d;
      box-shadow: 0 0 0 3px rgba(234, 106, 61, 0.15);
    }

    .role-select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #f5f5f5;
    }

    .toolbar {
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      max-width: 320px;
    }

    .search-input {
      width: 100%;
      padding: 8px 14px;
      border: 1px solid #d0d5dd;
      border-radius: 8px;
      font-size: 14px;
      background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #ea6a3d;
      box-shadow: 0 0 0 3px rgba(234, 106, 61, 0.15);
    }

    .btn-sync {
      padding: 8px 18px;
      border: 1px solid #d0d5dd;
      border-radius: 8px;
      background: #fff;
      font-size: 13px;
      font-weight: 500;
      color: #333;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
      white-space: nowrap;
    }

    .btn-sync:hover:not(:disabled) {
      background: #f5f5f5;
      border-color: #ea6a3d;
      color: #ea6a3d;
    }

    .btn-sync:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .user-row {
      cursor: pointer;
    }

    .user-row--selected {
      background-color: #fff8f0 !important;
      border-left: 3px solid #ea6a3d;
    }

    .detail-row td {
      padding: 0;
      background: #fafafa;
      border-bottom: 2px solid #e0e6ed;
    }

    .customer-detail {
      padding: 16px 24px;
      display: grid;
      gap: 16px;
      animation: slideDown 0.2s ease;
    }

    .detail-section {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .detail-section strong {
      min-width: 140px;
      color: #444;
    }

    .loyalty-section {
      flex-direction: column;
      align-items: flex-start;
    }

    .loyalty-section strong {
      margin-bottom: 8px;
    }

    .stamps-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .stamp {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: default;
      transition: transform 0.15s;
    }

    .stamp:hover {
      transform: scale(1.15);
    }

    .stamp--filled {
      background: #ea6a3d;
      color: #fff;
      box-shadow: 0 2px 6px rgba(234, 106, 61, 0.3);
    }

    .stamp--empty {
      background: #e9ecef;
      color: #adb5bd;
    }

    .stamp-icon {
      width: 22px;
      height: 22px;
      display: inline-block;
      animation: none;
    }

    .stamp-icon::before {
      width: 22px;
      height: 10px;
      left: 0;
      top: 0;
      border-radius: 4px;
    }

    .stamp-icon::after {
      left: 5px;
      top: 7px;
      width: 11px;
      height: 11px;
    }

    .stamp-icon.shima-icon--empty {
      opacity: 0.5;
    }

    .stamp-tooltip {
      display: none;
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: #1a1a2e;
      color: #fff;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      line-height: 1.5;
    }

    .stamp-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: #1a1a2e;
    }

    .stamp:hover .stamp-tooltip {
      display: block;
    }

    .tooltip-order-id {
      font-weight: 600;
    }

    .tooltip-status {
      color: #4caf50;
    }

    .tooltip-date {
      color: #aaa;
    }

    .stamps-info {
      font-size: 13px;
      color: #666;
      margin-top: 4px;
    }

    .restricted-msg {
      margin-top: 16px;
      font-size: 0.85rem;
      color: #888;
      font-style: italic;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideDown {
      from { opacity: 0; max-height: 0; }
      to { opacity: 1; max-height: 300px; }
    }
  `],
})
export class AdminUsersPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly clerk = inject(ClerkService);

  users: User[] = [];
  isSuperAdmin = false;
  readonly syncing = signal(false);
  readonly busca = signal('');
  readonly clienteSelecionado = signal<User | null>(null);
  readonly loyaltyCard = signal<LoyaltyCard | null>(null);

  readonly toast = signal<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

  private readonly ROLES = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'] as const;
  private readonly LABELS: Record<string, string> = {
    CUSTOMER: 'Cliente',
    ADMIN: 'Administrador',
    SUPER_ADMIN: 'Super Admin',
  };

  get usuariosFiltrados(): User[] {
    const termo = this.busca().toLowerCase().trim();
    if (!termo) return this.users;
    return this.users.filter(u => {
      const nome = this.nomeExibicao(u).toLowerCase();
      return nome.includes(termo);
    });
  }

  ngOnInit(): void {
    this.isSuperAdmin = this.clerk.isUserSuperAdmin();

    if (!this.isSuperAdmin) {
      this.clerk.fetchBackendRole().then((role) => {
        this.isSuperAdmin = role === 'SUPER_ADMIN';
      });
    }

    this.carregarUsuarios();
  }

  private pareceClerkId(valor: string): boolean {
    return /^user_[a-zA-Z0-9]+$/.test(valor);
  }

  nomeExibicao(user: User): string {
    const nome = user.fullName?.trim();
    if (!nome || this.pareceClerkId(nome)) {
      return user.clerkId || 'Sem nome';
    }
    return nome;
  }

  emailExibicao(user: User): string {
    const email = user.email?.trim();
    if (!email || this.pareceClerkId(email) || email === '${ADMIN_EMAIL}' || email === 'ADMIN_EMAIL') {
      return user.clerkId ? `${user.clerkId.substring(0, 12)}...@clerk` : '-';
    }
    return email;
  }

  opcoesPorRole(roleAtual: string): OpcaoRole[] {
    if (roleAtual === 'CUSTOMER') {
      return [
        { value: 'CUSTOMER', label: 'Cliente' },
        { value: 'ADMIN', label: 'Tornar ADMIN' },
        { value: 'SUPER_ADMIN', label: 'Tornar SUPER_ADMIN' },
      ];
    }

    if (roleAtual === 'ADMIN') {
      return [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'CUSTOMER', label: 'Rebaixar para Cliente' },
        { value: 'SUPER_ADMIN', label: 'Tornar SUPER_ADMIN' },
      ];
    }

    if (roleAtual === 'SUPER_ADMIN') {
      return [
        { value: 'SUPER_ADMIN', label: 'Super Admin' },
        { value: 'ADMIN', label: 'Rebaixar para ADMIN' },
        { value: 'CUSTOMER', label: 'Rebaixar para Cliente' },
      ];
    }

    return [{ value: roleAtual, label: roleAtual }];
  }

  onRoleChange(user: User, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const novaRole = select.value;
    if (user.role === novaRole) return;

    this.limparToast();
    this.getToken().then((token) => {
      if (!token) return;

      this.http
        .put<{ mensagem: string }>(
          `${API_BASE_URL}/admin/users/role`,
          { clerkId: user.clerkId, newRole: novaRole },
          { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) },
        )
        .subscribe({
          next: (res) => {
            this.toast.set({ texto: res.mensagem, tipo: 'sucesso' });
            this.carregarUsuarios();
          },
          error: (err) => {
            this.toast.set({
              texto: err.error?.erro || 'Erro ao alterar cargo',
              tipo: 'erro',
            });
          },
        });
    });
  }

  syncClerk(): void {
    this.syncing.set(true);
    this.limparToast();

    this.getToken().then((token) => {
      if (!token) {
        this.syncing.set(false);
        return;
      }

      this.http
        .post<{ mensagem: string }>(
          `${API_BASE_URL}/admin/users/sync-clerk`,
          {},
          { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) },
        )
        .subscribe({
          next: (res) => {
            this.toast.set({ texto: res.mensagem, tipo: 'sucesso' });
            this.syncing.set(false);
            this.carregarUsuarios();
          },
          error: (err) => {
            this.toast.set({
              texto: err.error?.erro || 'Erro ao sincronizar com Clerk',
              tipo: 'erro',
            });
            this.syncing.set(false);
          },
        });
    });
  }

  selecionarCliente(user: User): void {
    if (this.clienteSelecionado()?.clerkId === user.clerkId) {
      this.clienteSelecionado.set(null);
      this.loyaltyCard.set(null);
      return;
    }

    this.clienteSelecionado.set(user);
    this.loyaltyCard.set(null);

    if (user.role !== 'CUSTOMER') return;

    this.getToken().then((token) => {
      if (!token) return;

      this.http.get<{ card: LoyaltyCard | null }>(
        `${API_BASE_URL}/admin/loyalty/card/${user.clerkId}`,
        { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      ).subscribe({
        next: (res) => this.loyaltyCard.set(res.card),
        error: () => this.toast.set({ texto: 'Erro ao carregar cartão fidelidade', tipo: 'erro' })
      });
    });
  }

  gerarSelos(card: LoyaltyCard): { preenchido: boolean; tooltip: string; transaction: LoyaltyTransaction | null }[] {
    const selos: { preenchido: boolean; tooltip: string; transaction: LoyaltyTransaction | null }[] = [];
    const earned = card.transactions.filter(t => t.type === 'EARNED');

    for (let i = 0; i < card.stampsNeeded; i++) {
      const transaction = earned[i] || null;
      selos.push({
        preenchido: i < card.stamps,
        tooltip: transaction ? `${transaction.orderId ? 'Pedido #' + transaction.orderId : ''}` : '',
        transaction
      });
    }
    return selos;
  }

  onBuscaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.busca.set(input.value);
  }

  private carregarUsuarios(): void {
    this.getToken().then((token) => {
      if (!token) return;

      this.http
        .get<User[]>(`${API_BASE_URL}/admin/users`, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        })
        .subscribe({
          next: (users) => {
            this.users = users;
          },
          error: () => {
            this.toast.set({ texto: 'Erro ao carregar usuarios', tipo: 'erro' });
          },
        });
    });
  }

  private limparToast(): void {
    this.toast.set(null);
  }

  private async getToken(): Promise<string | null> {
    return await this.clerk.getToken();
  }
}
