import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClerkService } from '../../core/services/clerk.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="auth-page">
      <div id="clerk-signup-container"></div>
      <a routerLink="/login" class="auth-link">Já possui conta? <strong>Entrar</strong></a>
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
export class RegisterPageComponent implements OnInit {
  private readonly clerk = inject(ClerkService);

  ngOnInit(): void {
    // Desenha o formulário de cadastro na tela
    this.clerk.mountSignUp('clerk-signup-container');
  }
}
