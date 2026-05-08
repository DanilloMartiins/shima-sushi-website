import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="page-shell">
      <header class="topbar">
        <a class="brand" routerLink="/">
          <span>Seu Shima Sushi</span>
          <span class="brand-mini-logo" aria-hidden="true"></span>
        </a>

        <nav class="menu-links">
          <a routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }"
            >Cardapio</a
          >
          <a routerLink="/orders" routerLinkActive="is-active">Meus pedidos</a>
          <a *ngIf="authService.isAdmin()" routerLink="/admin" routerLinkActive="is-active"
            >Admin</a
          >
        </nav>

        <div class="topbar-actions">
          <a class="cart-chip" routerLink="/checkout">
            Carrinho <strong>{{ cartService.totalItems() }}</strong>
          </a>

          <ng-container *ngIf="authService.isAuthenticated(); else authButtons">
            <span class="user-email">{{ authService.email() }}</span>
            <button type="button" class="btn ghost" (click)="logout()">Sair</button>
          </ng-container>

          <ng-template #authButtons>
            <a class="btn ghost" routerLink="/login">Entrar</a>
            <a class="btn solid" routerLink="/register">Criar conta</a>
          </ng-template>
        </div>
      </header>

      <main class="content-wrap">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
    .page-shell {
      min-height: 100vh;
    }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--brand-border);
    }

    .brand {
      color: var(--brand-ink);
      text-decoration: none;
      font-weight: 800;
      letter-spacing: 0.4px;
      font-size: 1.45rem;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
    }

    .brand-mini-logo {
      position: relative;
      width: 20px;
      height: 20px;
      display: inline-block;
    }

    .brand-mini-logo::before {
      content: '';
      position: absolute;
      top: 0;
      left: -1px;
      width: 22px;
      height: 9px;
      background: #ea6a3d;
      clip-path: polygon(10% 100%, 45% 0%, 99% 72%);
      border-radius: 6px;
    }

    .brand-mini-logo::after {
      content: '';
      position: absolute;
      left: 6px;
      top: 7px;
      width: 10px;
      height: 10px;
      background: #171214;
      border-radius: 50%;
      box-shadow: 0 7px 0 -2px #171214;
    }

    .menu-links {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .menu-links a {
      color: var(--brand-muted);
      text-decoration: none;
      font-size: 1.05rem;
      padding: 0.45rem 0.7rem;
      border-radius: 999px;
      transition: color 180ms ease, background 180ms ease;
    }

    .menu-links a.is-active {
      background: rgba(234, 106, 61, 0.14);
      color: var(--brand-orange-strong);
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .cart-chip {
      text-decoration: none;
      color: #fff;
      background: var(--brand-ink);
      padding: 0.4rem 0.75rem;
      border-radius: 999px;
      font-size: 0.85rem;
    }

    .user-email {
      color: var(--brand-muted);
      font-size: 0.85rem;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .btn {
      border: 1px solid transparent;
      border-radius: 999px;
      padding: 0.4rem 0.8rem;
      font-size: 0.85rem;
      text-decoration: none;
      cursor: pointer;
    }

    .btn.ghost {
      color: var(--brand-ink);
      background: transparent;
      border-color: var(--brand-border);
    }

    .btn.solid {
      color: #fff;
      background: var(--brand-orange);
    }

    .content-wrap {
      width: min(1280px, 100% - 2.4rem);
      margin: 1.9rem auto 3rem;
    }

    @media (max-width: 900px) {
      .topbar {
        position: static;
      }

      .menu-links {
        order: 3;
        width: 100%;
        justify-content: flex-start;
        overflow-x: auto;
      }

      .topbar-actions {
        margin-left: auto;
      }
    }
  `,
  ],
})
export class PublicShellComponent {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);

  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        void this.router.navigateByUrl('/');
      },
    });
  }
}
