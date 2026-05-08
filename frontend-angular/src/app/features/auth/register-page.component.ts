import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <h1>Criar conta</h1>
      <p>Conta cliente para acompanhar pedidos e finalizar checkout.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
        <label>
          Nome
          <input type="text" formControlName="name" />
        </label>

        <label>
          Telefone
          <input type="tel" formControlName="phone" />
        </label>

        <label>
          E-mail
          <input type="email" formControlName="email" />
        </label>

        <label>
          Senha
          <input type="password" formControlName="password" />
        </label>

        <p class="error" *ngIf="errorMessage()">{{ errorMessage() }}</p>

        <button type="submit" [disabled]="form.invalid || loading()">
          <ng-container *ngIf="!loading(); else creatingLabel">Criar conta</ng-container>
          <ng-template #creatingLabel>
            <span class="shima-loader">
              <span class="shima-loader-icon" aria-hidden="true"></span>
              Criando...
            </span>
          </ng-template>
        </button>
      </form>

      <a routerLink="/login">Ja tenho conta</a>
    </section>
  `,
  styles: [
    `
      .auth-page {
        width: min(420px, 100%);
        margin: 2rem auto;
      }

      .auth-page p {
        color: var(--brand-muted);
      }

      .auth-form {
        display: grid;
        gap: 0.9rem;
        margin: 1rem 0;
      }

      label {
        display: grid;
        gap: 0.35rem;
        color: var(--brand-ink);
      }

      input {
        border-radius: 10px;
        border: 1px solid var(--brand-border);
        background: #fff;
        color: var(--brand-ink);
        padding: 0.55rem 0.65rem;
      }

      button {
        border: 0;
        border-radius: 999px;
        padding: 0.55rem 0.9rem;
        background: var(--brand-orange);
        color: #fff;
        font-weight: 700;
        cursor: pointer;
      }

      .error {
        margin: 0;
        color: #ff9f9f;
      }

      a {
        color: var(--brand-orange-strong);
        text-decoration: none;
      }
    `,
  ],
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        void this.router.navigateByUrl('/');
      },
      error: () => {
        this.errorMessage.set('Nao foi possivel criar a conta com os dados informados.');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }
}
