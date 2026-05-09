import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UpdateStoreSettingsRequest } from '../../core/models/store.models';
import { StoreSettingsService } from '../../core/services/store-settings.service';

@Component({
  selector: 'app-admin-store-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <article class="card">
      <h2>Configuracoes da loja</h2>

      <form [formGroup]="form" (ngSubmit)="save()">
        <label>
          Loja Aberta?
          <input type="checkbox" formControlName="storeOpen" />
        </label>

        <label>
          Mensagem de Loja Aberta
          <input type="text" formControlName="openingMessage" />
        </label>

        <label>
          Mensagem de Loja Fechada
          <input type="text" formControlName="closingMessage" />
        </label>

        <label>
          WhatsApp
          <input type="text" formControlName="whatsappNumber" />
        </label>

        <div class="inline-grid">
          <label>
            Taxa de Entrega (R$)
            <input type="number" min="0" step="0.01" formControlName="deliveryFee" />
          </label>

          <label>
            Pedido Mínimo (R$)
            <input type="number" min="0" step="0.01" formControlName="minimumOrderValue" />
          </label>
        </div>

        <p class="success" *ngIf="successMessage()">{{ successMessage() }}</p>
        <p class="error" *ngIf="errorMessage()">{{ errorMessage() }}</p>

        <button type="submit" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Salvando...' : 'Salvar configuracoes' }}
        </button>
      </form>
    </article>
  `,
  styles: [
    `
      .card {
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 14px;
        background: rgba(9, 11, 17, 0.8);
        padding: 1rem;
      }

      form {
        display: grid;
        gap: 0.85rem;
      }

      label {
        display: grid;
        gap: 0.3rem;
      }

      input {
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(7, 9, 14, 0.65);
        color: #f7f9ff;
        padding: 0.55rem 0.65rem;
      }

      .inline-grid {
        display: grid;
        gap: 0.8rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      button {
        border: 0;
        border-radius: 999px;
        padding: 0.55rem 0.85rem;
        background: #f9bd44;
        color: #2c2217;
        font-weight: 700;
        cursor: pointer;
      }

      .success {
        margin: 0;
        color: #8ee0b2;
      }

      .error {
        margin: 0;
        color: #ff9f9f;
      }

      @media (max-width: 720px) {
        .inline-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminStoreSettingsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly storeSettingsService = inject(StoreSettingsService);

  readonly saving = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    storeOpen: [false, [Validators.required]],
    openingMessage: ['', [Validators.required]],
    closingMessage: ['', [Validators.required]],
    whatsappNumber: ['', [Validators.required]],
    deliveryFee: [0, [Validators.required, Validators.min(0)]],
    minimumOrderValue: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.storeSettingsService.getAdminStoreSettings().subscribe({
      next: (settings) => {
        this.form.patchValue({
          storeOpen: settings.storeOpen,
          openingMessage: settings.openingMessage,
          closingMessage: settings.closingMessage,
          whatsappNumber: settings.whatsappNumber,
          deliveryFee: settings.deliveryFee,
          minimumOrderValue: settings.minimumOrderValue,
        });
      },
      error: () => {
        this.errorMessage.set('Nao foi possivel carregar configuracoes da loja.');
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const value = this.form.getRawValue();
    const payload: UpdateStoreSettingsRequest = {
      storeOpen: value.storeOpen,
      openingMessage: value.openingMessage,
      closingMessage: value.closingMessage,
      whatsappNumber: value.whatsappNumber,
      deliveryFee: value.deliveryFee,
      minimumOrderValue: value.minimumOrderValue,
    };

    this.storeSettingsService.updateAdminStoreSettings(payload).subscribe({
      next: () => {
        this.successMessage.set('Configuracoes salvas com sucesso.');
      },
      error: () => {
        this.errorMessage.set('Nao foi possivel salvar configuracoes.');
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }
}
