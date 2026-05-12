import { Component, inject } from '@angular/core';
import { ClerkService } from '../../core/services/clerk.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  template: `
    <section class="auth-page">
      <h1>Criar conta</h1>
      <p>Crie sua conta para uma experiencia completa no Shima Sushi.</p>
      
      <button class="clerk-btn" (click)="clerk.openSignUp()">
        Clique para Criar conta com o Clerk
      </button>

      <div class="divider"></div>
      
      <p class="footer-text">Ja tem conta? <a href="javascript:void(0)" (click)="clerk.openSignIn()">Fazer login</a></p>
    </section>
  `,
  styles: [`
    .auth-page { width: min(420px, 100%); margin: 4rem auto; text-align: center; }
    .clerk-btn { 
      background: var(--brand-orange); 
      color: white; 
      border: none; 
      padding: 1rem 2rem; 
      border-radius: 99px; 
      font-weight: bold; 
      cursor: pointer;
      font-size: 1.1rem;
    }
    .divider { margin: 2rem 0; border-top: 1px solid var(--brand-border); }
    .footer-text { color: var(--brand-muted); }
    a { color: var(--brand-orange-strong); text-decoration: none; font-weight: bold; }
  `]
})
export class RegisterPageComponent {
  readonly clerk = inject(ClerkService);
}
