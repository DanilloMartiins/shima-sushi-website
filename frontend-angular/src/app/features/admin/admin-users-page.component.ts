import { Component, inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2 class="page-title">Gerenciar Usuários</h2>

      <div class="table-wrapper">
        <table class="user-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Role</th>
              <th>Clerk ID</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td class="cell-name">{{ user.fullName }}</td>
              <td class="cell-email">{{ user.email || '-' }}</td>
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
              <td class="cell-clerk-id">{{ user.clerkId || '-' }}</td>
              <td class="cell-actions">
                <button
                  *ngIf="user.role === 'CUSTOMER'"
                  class="btn btn-promote"
                  [disabled]="!isSuperAdmin"
                  (click)="promover(user.clerkId)"
                >
                  Promover
                </button>
                <button
                  *ngIf="user.role === 'ADMIN'"
                  class="btn btn-demote"
                  [disabled]="!isSuperAdmin"
                  (click)="rebaixar(user.clerkId)"
                >
                  Rebaixar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p *ngIf="mensagem" class="mensagem">{{ mensagem }}</p>
      <p *ngIf="erro" class="erro">{{ erro }}</p>
    </div>
  `,
  styles: [
    `
      .page-container {
        animation: fadeIn 0.3s ease-in-out;
      }

      .page-title {
        font-size: 1.75rem;
        font-weight: 600;
        color: #1a1a2e;
        margin-bottom: 24px;
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
        white-space: nowrap;
      }

      .btn {
        padding: 6px 14px;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s, opacity 0.2s;
      }

      .btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .btn-promote {
        background: #28a745;
        color: #fff;
      }

      .btn-promote:not(:disabled):hover {
        background: #218838;
      }

      .btn-demote {
        background: #dc3545;
        color: #fff;
      }

      .btn-demote:not(:disabled):hover {
        background: #c82333;
      }

      .mensagem {
        margin-top: 16px;
        padding: 10px 16px;
        background: #d4edda;
        color: #155724;
        border-radius: 6px;
      }

      .erro {
        margin-top: 16px;
        padding: 10px 16px;
        background: #f8d7da;
        color: #721c24;
        border-radius: 6px;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
  ],
})
export class AdminUsersPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly clerk = inject(ClerkService);

  users: User[] = [];
  isSuperAdmin = false;
  mensagem = '';
  erro = '';

  ngOnInit(): void {
    /*
     * Pega a role do backend (ja foi carregada pelo AdminShellComponent)
     */
    this.isSuperAdmin = this.clerk.isUserSuperAdmin();

    /*
     * Se ainda nao carregou, tenta buscar agora
     */
    if (!this.isSuperAdmin) {
      this.clerk.fetchBackendRole().then((role) => {
        this.isSuperAdmin = role === 'SUPER_ADMIN';
      });
    }

    this.carregarUsuarios();
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
            this.erro = 'Erro ao carregar usuarios';
          },
        });
    });
  }

  promover(clerkId: string): void {
    this.limparMensagens();
    this.getToken().then((token) => {
      if (!token) return;

      this.http
        .put<any>(
          `${API_BASE_URL}/admin/users/promote`,
          { clerkId },
          { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) },
        )
        .subscribe({
          next: (res) => {
            this.mensagem = res.mensagem;
            this.carregarUsuarios();
          },
          error: (err) => {
            this.erro = err.error?.erro || 'Erro ao promover usuario';
          },
        });
    });
  }

  rebaixar(clerkId: string): void {
    this.limparMensagens();
    this.getToken().then((token) => {
      if (!token) return;

      this.http
        .put<any>(
          `${API_BASE_URL}/admin/users/demote`,
          { clerkId },
          { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) },
        )
        .subscribe({
          next: (res) => {
            this.mensagem = res.mensagem;
            this.carregarUsuarios();
          },
          error: (err) => {
            this.erro = err.error?.erro || 'Erro ao rebaixar usuario';
          },
        });
    });
  }

  private limparMensagens(): void {
    this.mensagem = '';
    this.erro = '';
  }

  private async getToken(): Promise<string | null> {
    return await this.clerk.getToken();
  }
}
