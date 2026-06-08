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
  createdAt: string;
  updatedAt: string;
}

interface OpcaoRole {
  value: string;
  label: string;
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
            @for (user of users; track user.id) {
              <tr>
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
  `],
})
export class AdminUsersPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly clerk = inject(ClerkService);

  users: User[] = [];
  isSuperAdmin = false;

  readonly toast = signal<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null);

  private readonly ROLES = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'] as const;
  private readonly LABELS: Record<string, string> = {
    CUSTOMER: 'Cliente',
    ADMIN: 'Administrador',
    SUPER_ADMIN: 'Super Admin',
  };

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
