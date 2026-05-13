import { Component, OnInit, inject } from '@angular/core';
import { ClerkService } from '../../core/services/clerk.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  template: `
    <section class="auth-page">
      <div id="clerk-signup-container"></div>
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
export class RegisterPageComponent implements OnInit {
  private readonly clerk = inject(ClerkService);

  ngOnInit(): void {
    // Desenha o formulário de cadastro na tela
    this.clerk.mountSignUp('clerk-signup-container');
  }
}
