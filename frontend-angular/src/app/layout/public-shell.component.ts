import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { ClerkService } from '../core/services/clerk.service';
import { CartService } from '../core/services/cart.service';
import { APP_VERSION } from '../../environments/version';

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
          <a routerLink="/cardapio" routerLinkActive="is-active">Cardapio</a>
          <a routerLink="/orders" routerLinkActive="is-active">Meus pedidos</a>
          <a *ngIf="clerk.isUserAdmin()" routerLink="/admin" routerLinkActive="is-active"
            >Admin</a
          >
        </nav>

        <div class="topbar-actions">
          <a class="cart-chip" routerLink="/checkout">
            Carrinho <strong>{{ cartService.totalItems() }}</strong>
          </a>

          <ng-container *ngIf="clerk.user() as user; else authButtons">
            <!-- Novo bloco com Foto e Nome (link para o perfil) -->
            <a routerLink="/perfil" class="user-profile-link">
              <img [src]="user.imageUrl" class="user-avatar" alt="Perfil" />
              <span class="user-name">{{ user.fullName || 'Minha Conta' }}</span>
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

      <footer class="site-footer">
        <div class="footer-inner">
          <span class="footer-copy">
            &copy; {{ anoAtual }} Seu Shima Sushi. Todos os direitos reservados.
          </span>
          <span class="footer-dev">
            Desenvolvido por
            <a href="https://www.linkedin.com/in/danillomartins/" target="_blank" rel="noopener noreferrer">
              Danillo Martins
            </a>
          </span>
          <span class="footer-version">{{ APP_VERSION }}</span>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
    .page-shell { min-height: 100vh; display: flex; flex-direction: column; }

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

    .menu-links { display: flex; align-items: stretch; gap: 0.25rem; }
    .menu-links a {
      color: var(--brand-muted); text-decoration: none; font-size: 0.85rem;
      padding: 0.35rem 0.55rem; border-radius: 8px; transition: 180ms ease;
      white-space: nowrap; display: flex; align-items: center; line-height: 1.35;
    }
    .menu-links a.is-active { background: rgba(234, 106, 61, 0.14); color: var(--brand-orange-strong); }

    .topbar-actions { display: flex; align-items: center; gap: 0.5rem; }

    .cart-chip {
      text-decoration: none; color: #fff; background: var(--brand-ink);
      border-radius: 8px; padding: 0.35rem 0.7rem; font-size: 0.85rem;
      display: flex; align-items: center; gap: 0.3rem; line-height: 1.35;
    }

    .user-profile-link {
      display: flex; align-items: center; gap: 0.4rem;
      text-decoration: none; padding: 0.15rem 0.2rem;
      border-radius: 99px; transition: background 0.2s;
    }
    .user-profile-link:hover { background: rgba(0,0,0,0.04); }

    .user-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--brand-orange); }

    .user-name { color: var(--brand-ink); font-weight: 600; font-size: 0.82rem; max-width: 90px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .btn-logout { background: transparent; border: none; color: var(--brand-muted); cursor: pointer; display: flex; align-items: center; padding: 0.3rem; border-radius: 50%; transition: 0.2s; }
    .btn-logout:hover { background: #fff1f1; color: #ff4d4d; }

    .btn { border-radius: 8px; padding: 0.35rem 0.8rem; font-size: 0.85rem; text-decoration: none; cursor: pointer; line-height: 1.35; border: 1px solid transparent; display: inline-flex; align-items: center; justify-content: center; }
    .btn.ghost { color: var(--brand-ink); background: transparent; border-color: var(--brand-border); }
    .btn.solid { color: #fff; background: var(--brand-orange); border-color: var(--brand-orange); }

    .content-wrap { width: min(1280px, 100% - 1.5rem); margin: 1.2rem auto; flex: 1; }

    .site-footer {
      border-top: 1px solid var(--brand-border);
      background: #fafafa;
      padding: 1.5rem 1.25rem;
    }
    .footer-inner {
      width: min(1280px, 100%);
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      font-size: 0.82rem;
      color: var(--brand-muted);
    }
    .footer-dev a {
      color: var(--brand-orange-strong);
      text-decoration: none;
      font-weight: 600;
    }
    .footer-dev a:hover {
      text-decoration: underline;
    }
    .footer-version {
      font-family: monospace;
      font-size: 0.78rem;
      opacity: 0.6;
    }

    @media (max-width: 900px) {
      .topbar { padding: 0.55rem 0.75rem; }
      .menu-links { order: 3; width: 100%; justify-content: space-around; border-top: 1px solid var(--brand-border); padding-top: 0.35rem; margin-top: 0.15rem; }
      .topbar-actions { margin-left: auto; }
      .user-name { display: none; }
      .brand { font-size: 1.1rem; }
      .menu-links a { font-size: 0.82rem; padding: 0.3rem 0.45rem; }
    }
    
    @media (max-width: 480px) {
      .topbar { gap: 0.4rem; }
      .menu-links a { font-size: 0.8rem; padding: 0.25rem 0.35rem; }
      .topbar-actions { gap: 0.3rem; }
      .btn { padding: 0.3rem 0.6rem; font-size: 0.82rem; }
      .brand { font-size: 0.95rem; }
    }
  `,
  ],
})
export class PublicShellComponent {
  readonly clerk = inject(ClerkService);
  readonly cartService = inject(CartService);

  readonly APP_VERSION = APP_VERSION;
  readonly anoAtual = new Date().getFullYear();

  private readonly router = inject(Router);

  logout(): void {
    void this.clerk.signOut().then(() => {
      void this.router.navigateByUrl('/');
    });
  }
}
