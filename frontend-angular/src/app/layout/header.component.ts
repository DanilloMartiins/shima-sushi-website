import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '@core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="main-header">
      <div class="header-content">
        <a class="brand" href="#inicio">
          <img src="/assets/images/logoSeuShima.png" alt="Logo Seu Shima Sushi" class="logo" />
          <div class="brand-copy">
            <span class="brand-name">Seu Shima Sushi</span>
            <span class="brand-subtext">Culinária Oriental • Carpina</span>
          </div>
        </a>
        
        <nav class="nav-menu">
          <a href="#inicio">Início</a>
          <a href="#cardapio">Cardápio</a>
          <a href="#localizacao">Localização</a>
          <a href="#contato">Contato</a>
        </nav>
        
        <button class="btn-primary">
          🛒 Carrinho ({{ cartService.totalItems() }})
        </button>
      </div>
    </header>
  `,
  styles: [`
    .main-header { background: var(--surface-color); border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 100; box-shadow: var(--shadow-sm); }
    .header-content { display: flex; justify-content: space-between; align-items: center; padding: 12px 5%; max-width: 1200px; margin: 0 auto; }
    .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
    .logo { width: 55px; height: 55px; object-fit: contain; }
    .brand-copy { display: flex; flex-direction: column; }
    .brand-name { font-family: var(--font-display); font-size: 1.5rem; color: var(--primary-color); line-height: 1; margin: 0; }
    .brand-subtext { font-family: var(--font-body); font-size: 0.75rem; color: var(--text-secondary); }
    .nav-menu { display: none; gap: 24px; }
    .nav-menu a { text-decoration: none; color: var(--text-primary); font-weight: 500; transition: var(--transition); }
    .nav-menu a:hover { color: var(--primary-color); }
    @media (min-width: 768px) { .nav-menu { display: flex; align-items: center; } }
  `]
})
export class HeaderComponent {
  public cartService = inject(CartService);
}