import { Component, OnInit, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ClerkService } from '../../core/services/clerk.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  template: `
    <section class="auth-page">
      <div id="clerk-signin-container"></div>
    </section>
  `,
  styles: [`
    .auth-page { 
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70vh;
      padding: 2rem;
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
