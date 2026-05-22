import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <h2 class="sidebar-title">Seu Shima</h2>
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
            routerLink="/admin/settings"
            routerLinkActive="active"
            class="nav-link"
            >Configurações</a
          >
        </nav>
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

      .sidebar-title {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin-bottom: 32px;
        text-align: center;
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

      .admin-main-content {
        flex: 1;
        padding: 32px;
        overflow-y: auto;
      }
    `,
  ],
})
export class AdminShellComponent {}
