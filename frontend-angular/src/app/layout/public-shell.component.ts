import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { ClerkService } from '../core/services/clerk.service';
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
          <a *ngIf="isUserAdmin()" routerLink="/admin" routerLinkActive="is-active"
            >Admin</a
          >
        </nav>

        <div class="topbar-actions">
          <a class="cart-chip" routerLink="/checkout">
            Carrinho <strong>{{ cartService.totalItems() }}</strong>
          </a>

          <ng-container *ngIf="clerk.user(); else authButtons">
            <!-- Novo bloco com Foto e Nome (link para o perfil) -->
            <a routerLink="/perfil" class="user-profile-link">
              <img [src]="clerk.user().imageUrl" class="user-avatar" alt="Perfil" />
              <span class="user-name">{{ clerk.user().fullName || 'Minha Conta' }}</span>
            </a>
            <button type="button" class="btn-logout" (click)="logout()" title="Sair">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
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
    .page-shell { min-height: 100vh; }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.8rem 1.25rem;
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

    .menu-links { display: flex; align-items: center; gap: 0.8rem; }
    .menu-links a {
      color: var(--brand-muted); text-decoration: none; font-size: 1.05rem;
      padding: 0.45rem 0.7rem; border-radius: 999px; transition: 180ms ease;
    }
    .menu-links a.is-active { background: rgba(234, 106, 61, 0.14); color: var(--brand-orange-strong); }

    .topbar-actions { display: flex; align-items: center; gap: 0.8rem; }

    .cart-chip {
      text-decoration: none; color: #fff; background: var(--brand-ink);
      padding: 0.4rem 0.75rem; border-radius: 999px; font-size: 0.85rem;
    }

    /* Estilo do novo Perfil */
    .user-profile-link {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      padding: 0.25rem 0.5rem;
      border-radius: 99px;
      transition: background 0.2s;
    }
    .user-profile-link:hover { background: rgba(0,0,0,0.04); }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--brand-orange);
    }

    .user-name {
      color: var(--brand-ink);
      font-weight: 600;
      font-size: 0.9rem;
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-logout {
      background: transparent;
      border: none;
      color: var(--brand-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0.5rem;
      border-radius: 50%;
      transition: 0.2s;
    }
    .btn-logout:hover { background: #fff1f1; color: #ff4d4d; }

    .btn {
      border: 1px solid transparent; border-radius: 999px; padding: 0.4rem 0.8rem;
      font-size: 0.85rem; text-decoration: none; cursor: pointer;
    }
    .btn.ghost { color: var(--brand-ink); background: transparent; border-color: var(--brand-border); }
    .btn.solid { color: #fff; background: var(--brand-orange); }

    .content-wrap { width: min(1280px, 100% - 2.4rem); margin: 1.9rem auto 3rem; }

    @media (max-width: 900px) {
      .topbar { position: static; }
      .menu-links { order: 3; width: 100%; justify-content: flex-start; overflow-x: auto; }
      .topbar-actions { margin-left: auto; }
      .user-name { display: none; } /* Em telas pequenas, mostra só a bolinha com a foto */
    }
  `,
  ],
})
export class PublicShellComponent {
  readonly clerk = inject(ClerkService);
  readonly cartService = inject(CartService);

  private readonly router = inject(Router);

  isUserAdmin(): boolean {
    const user = this.clerk.user();
    return user && (user.publicMetadata?.['role'] === 'ADMIN' || user.primaryEmailAddress?.emailAddress === 'admin@seushimasushi.com');
  }

  logout(): void {
    void this.clerk.signOut().then(() => {
      void this.router.navigateByUrl('/');
    });
  }
}
