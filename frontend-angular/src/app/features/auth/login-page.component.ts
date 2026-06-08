import { Component, OnInit, inject, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClerkService } from '../../core/services/clerk.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="auth-page">
      <div id="clerk-signin-container"></div>
      <a routerLink="/register" class="auth-link">Não tem conta? <strong>Registre-se</strong></a>
    </section>
  `,
  styles: [`
    .auth-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      padding: 2rem;
      gap: 1rem;
    }
    .auth-link {
      font-size: 0.9rem;
      color: var(--brand-muted);
      text-decoration: none;
      text-align: center;
    }
    .auth-link strong {
      color: var(--brand-orange-strong, #c85a2f);
    }
    .auth-link:hover strong {
      text-decoration: underline;
    }
  `]
})
export class LoginPageComponent implements OnInit {
  readonly clerk = inject(ClerkService);
  private readonly router = inject(Router);

  constructor() {
    // Redireciona automaticamente se o usuário já estiver autenticado
    effect(() => {
      if (this.clerk.user()) {
        void this.router.navigateByUrl('/');
      }
    });
  }

  ngOnInit(): void {
    // Se já entrar logado (ex: volta do Google), já redireciona de cara
    if (this.clerk.user()) {
      void this.router.navigateByUrl('/');
      return;
    }
    
    this.clerk.mountSignIn('clerk-signin-container');
  }
}
