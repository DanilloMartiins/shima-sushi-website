import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ClerkService } from '../../core/services/clerk.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <span class="brand">
          <span>Seu Shima Sushi</span>
          <span class="brand-mini-logo" aria-hidden="true"></span>
        </span>
        <nav class="admin-nav">
          <a
            routerLink="/admin/products"
            routerLinkActive="active"
            class="nav-link"
            >Produtos</a
          >
          <a
            routerLink="/admin/orders"
            routerLinkActive="active"
            class="nav-link"
            >Pedidos</a
          >
          <a
            routerLink="/admin/users"
            routerLinkActive="active"
            class="nav-link"
            >Usuários</a
          >
          <a
            routerLink="/admin/inventory"
            routerLinkActive="active"
            class="nav-link"
            >Almoxarifado</a
          >
          <a
            routerLink="/admin/settings"
            routerLinkActive="active"
            class="nav-link"
            >Configurações</a
          >
        </nav>

        <div class="sidebar-spacer"></div>

        <button type="button" class="btn-logout" (click)="logout()">Sair</button>
      </aside>
      <main class="admin-main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        background-color: #f4f7fa;
      }

      .admin-layout {
        display: flex;
        height: 100%;
      }

      .admin-sidebar {
        width: 240px;
        background-color: #ffffff;
        border-right: 1px solid #e0e6ed;
        padding: 24px;
        display: flex;
        flex-direction: column;
      }

      .brand {
        color: var(--brand-ink);
        font-weight: 800;
        letter-spacing: 0.4px;
        font-size: 1.45rem;
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        margin-bottom: 32px;
      }

      .brand-mini-logo {
        position: relative; width: 20px; height: 20px; display: inline-block;
      }
      .brand-mini-logo::before {
        content: ''; position: absolute; top: 0; left: -1px; width: 22px; height: 9px;
        background: #ea6a3d; clip-path: polygon(10% 100%, 45% 0%, 99% 72%); border-radius: 6px;
      }
      .brand-mini-logo::after {
        content: ''; position: absolute; left: 6px; top: 7px; width: 10px; height: 10px;
        background: #171214; border-radius: 50%; box-shadow: 0 7px 0 -2px #171214;
      }

      .admin-nav {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .nav-link {
        color: #555;
        text-decoration: none;
        font-size: 16px;
        padding: 12px 16px;
        border-radius: 6px;
        transition: background-color 0.2s, color 0.2s;
      }

      .nav-link:hover {
        background-color: #f0f0f0;
      }

      .nav-link.active {
        background-color: #3498db;
        color: #ffffff;
        font-weight: 500;
      }

      .sidebar-spacer {
        flex: 1;
      }

      .btn-logout {
        background: transparent;
        border: none;
        color: #e74c3c;
        font-size: 16px;
        font-weight: 600;
        padding: 12px 16px;
        border-radius: 6px;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.2s;
      }

      .btn-logout:hover {
        background-color: #fff1f1;
      }

      .admin-main-content {
        flex: 1;
        padding: 32px;
        overflow-y: auto;
      }
    `,
  ],
})
export class AdminShellComponent implements OnInit {
  private readonly clerk = inject(ClerkService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    /*
     * Busca a role no backend pra cacahcar no ClerkService
     * Isso garante que usuarios promovidos via API sejam reconhecidos
     */
    void this.clerk.fetchBackendRole();
  }

  logout(): void {
    void this.clerk.signOut().then(() => {
      void this.router.navigateByUrl('/');
    });
  }
}
