import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  DAY_LABELS,
  UpdateStoreSettingsRequest,
  StoreSettingsResponse,
} from '../../core/models/store.models';
import { StoreSettingsService } from '../../core/services/store-settings.service';
import { ClerkService } from '../../core/services/clerk.service';
import { API_BASE_URL } from '../../core/constants/api.constants';

@Component({
  selector: 'app-admin-store-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="settings-page">
      <header class="page-header">
        <h1>Configurações da Loja</h1>
        <button type="button" class="btn-save-header" (click)="save()" [disabled]="saving()">
          {{ saving() ? 'Salvando...' : 'Salvar Configurações' }}
        </button>
      </header>

      <p class="msg-success" *ngIf="successMessage()">{{ successMessage() }}</p>
      <p class="msg-error" *ngIf="errorMessage()">{{ errorMessage() }}</p>

      <form [formGroup]="form">
        <!-- CARD: Status e Horários -->
        <section class="card">
          <div class="card-header">
            <h2>Status e Horários</h2>
          </div>

          <div class="card-body">
            <label class="toggle-row">
              <span class="toggle-label">Loja Aberta Manualmente</span>
              <input type="checkbox" formControlName="storeOpen" class="toggle-input" />
              <span class="toggle-switch"></span>
            </label>
            <p class="field-hint">
              Se desligado, a loja fica fechada independente do horário agendado.
            </p>

            <div class="divider"></div>

            <label class="section-subtitle">Horário de Funcionamento por Dia</label>

            <div class="hours-grid" formArrayName="businessHours">
              <div
                class="hour-row"
                *ngFor="let day of businessHours.controls; let i = index"
                [formGroupName]="i"
              >
                <label class="hour-day-toggle">
                  <input type="checkbox" formControlName="enabled" />
                  <span class="day-label">{{ DAY_LABELS[i] }}</span>
                </label>

                <div class="hour-time-range" *ngIf="day.get('enabled')?.value">
                  <input type="time" formControlName="openTime" />
                  <span class="hour-separator">até</span>
                  <input type="time" formControlName="closeTime" />
                </div>

                <span class="hour-closed" *ngIf="!day.get('enabled')?.value">Fechado</span>
              </div>
            </div>
          </div>
        </section>

        <!-- CARD: Mensagens -->
        <section class="card">
          <div class="card-header">
            <h2>Mensagens</h2>
          </div>

          <div class="card-body">
            <div class="form-group">
              <label for="openingMessage">Mensagem de Loja Aberta</label>
              <input
                id="openingMessage"
                type="text"
                formControlName="openingMessage"
                placeholder="Ex: Estamos abertos! Faça seu pedido."
              />
            </div>

            <div class="form-group">
              <label for="closingMessage">Mensagem de Loja Fechada</label>
              <input
                id="closingMessage"
                type="text"
                formControlName="closingMessage"
                placeholder="Ex: Fechamos! Volte amanhã."
              />
            </div>
          </div>
        </section>

        <!-- CARD: Contato e Endereço -->
        <section class="card">
          <div class="card-header">
            <h2>Contato e Endereço</h2>
          </div>

          <div class="card-body">
            <div class="form-group">
              <label for="whatsappNumber">WhatsApp</label>
              <input
                id="whatsappNumber"
                type="text"
                formControlName="whatsappNumber"
                placeholder="Ex: 5511999999999"
              />
            </div>

            <div class="inline-grid">
              <div class="form-group">
                <label for="addressStreet">Rua</label>
                <input id="addressStreet" type="text" formControlName="addressStreet" placeholder="Rua" />
              </div>
              <div class="form-group">
                <label for="addressNumber">Número</label>
                <input id="addressNumber" type="text" formControlName="addressNumber" placeholder="Nº" />
              </div>
            </div>

            <div class="inline-grid">
              <div class="form-group">
                <label for="neighborhood">Bairro</label>
                <input id="neighborhood" type="text" formControlName="neighborhood" placeholder="Bairro" />
              </div>
              <div class="form-group">
                <label for="city">Cidade</label>
                <input id="city" type="text" formControlName="city" placeholder="Cidade" />
              </div>
            </div>

            <div class="inline-grid">
              <div class="form-group">
                <label for="zipCode">CEP</label>
                <input id="zipCode" type="text" formControlName="zipCode" placeholder="00000-000" (blur)="buscaCep()" />
              </div>
            </div>

            <div class="form-group">
              <label for="referencePoint">Ponto de Referência</label>
              <input id="referencePoint" type="text" formControlName="referencePoint" placeholder="Ex: Próximo ao Shopping Vitória" />
            </div>
          </div>
        </section>

        <!-- CARD: Formas de Pagamento -->
        <section class="card">
          <div class="card-header">
            <h2>Formas de Pagamento</h2>
          </div>

          <div class="card-body" formGroupName="paymentMethods">
            <div class="checkbox-grid">
              <label class="checkbox-row" *ngFor="let opt of PAYMENT_OPTIONS">
                <input type="checkbox" [formControlName]="opt.key" />
                <span class="checkbox-label">{{ opt.label }}</span>
                <span class="checkbox-icon">{{ opt.icon }}</span>
              </label>
            </div>
          </div>
        </section>

        <!-- CARD: Logística -->
        <section class="card">
          <div class="card-header">
            <h2>Logística</h2>
          </div>

          <div class="card-body">
            <div class="inline-grid">
              <div class="form-group">
                <label for="deliveryFee">Taxa de Entrega (R$)</label>
                <input
                  id="deliveryFee"
                  type="number"
                  min="0"
                  step="0.01"
                  formControlName="deliveryFee"
                />
              </div>

              <div class="form-group">
                <label for="minimumOrderValue">Pedido Mínimo (R$)</label>
                <input
                  id="minimumOrderValue"
                  type="number"
                  min="0"
                  step="0.01"
                  formControlName="minimumOrderValue"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="estimatedDeliveryTime">Tempo Estimado de Entrega</label>
              <input
                id="estimatedDeliveryTime"
                type="text"
                formControlName="estimatedDeliveryTime"
                placeholder="Ex: 40 - 60 min"
              />
            </div>
          </div>
        </section>

        <!-- CARD: Cartão Fidelidade -->
        <section class="card">
          <div class="card-header">
            <h2>Cartão Fidelidade</h2>
          </div>

          <div class="card-body">
            <div class="inline-grid">
              <div class="form-group">
                <label for="stampsNeeded">Selos necessários para prêmio</label>
                <input
                  id="stampsNeeded"
                  type="number"
                  min="1"
                  [(ngModel)]="loyaltyStampsNeeded"
                  placeholder="Ex: 10"
                />
              </div>

              <div class="form-group">
                <label for="minOrderAmount">Pedido mínimo (R$) para ganhar selo</label>
                <input
                  id="minOrderAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  [(ngModel)]="loyaltyMinOrder"
                  placeholder="Ex: 0"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="prizeDescription">Descrição do prêmio</label>
              <input
                id="prizeDescription"
                type="text"
                [(ngModel)]="loyaltyPrize"
                placeholder="Ex: 1 produto grátis do cardápio"
              />
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn-save-loyalty"
                (click)="salvarLoyalty()"
                [disabled]="loyaltySaving()"
              >
                {{ loyaltySaving() ? 'Salvando...' : 'Salvar Configuração de Fidelidade' }}
              </button>
              <span *ngIf="loyaltySaved()" class="saved-msg">Salvo!</span>
            </div>
          </div>
        </section>

        <!-- CARD: Perfil da Loja -->
        <section class="card">
          <div class="card-header">
            <h2>Perfil da Loja</h2>
          </div>

          <div class="card-body">
            <div class="upload-grid">
              <div class="upload-box">
                <span class="upload-label">Logo</span>
                <div class="upload-preview" [class.has-image]="logoPreview()">
                  <img *ngIf="logoPreview()" [src]="logoPreview()" alt="Logo preview" />
                  <span *ngIf="!logoPreview()" class="upload-placeholder">+</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  (change)="onLogoSelected($event)"
                  class="upload-input"
                />
                <button
                  type="button"
                  class="btn-remove"
                  *ngIf="logoPreview()"
                  (click)="removeLogo()"
                >
                  Remover
                </button>
              </div>

              <div class="upload-box">
                <span class="upload-label">Foto de Capa</span>
                <div class="upload-preview upload-preview--wide" [class.has-image]="coverPreview()">
                  <img *ngIf="coverPreview()" [src]="coverPreview()" alt="Capa preview" />
                  <span *ngIf="!coverPreview()" class="upload-placeholder">+</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  (change)="onCoverSelected($event)"
                  class="upload-input"
                />
                <button
                  type="button"
                  class="btn-remove"
                  *ngIf="coverPreview()"
                  (click)="removeCover()"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  `,
  styles: [
    `
      .settings-page {
        animation: fadeIn 0.3s ease-in-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .page-header h1 {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin: 0;
      }

      .btn-save-header {
        border: none;
        padding: 10px 22px;
        font-size: 14px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        background: var(--brand-orange, #ea6a3d);
        color: #fff;
        transition: background 0.2s;
      }

      .btn-save-header:hover:not(:disabled) {
        background: var(--brand-orange-strong, #d95b2f);
      }

      .btn-save-header:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .msg-success {
        margin: 0 0 16px;
        padding: 12px 16px;
        background: #eaf7f0;
        color: #28a745;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
      }

      .msg-error {
        margin: 0 0 16px;
        padding: 12px 16px;
        background: #fbeae5;
        color: #dc3545;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
      }

      .card {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        margin-bottom: 20px;
        overflow: hidden;
      }

      .card-header {
        padding: 18px 24px;
        border-bottom: 1px solid #f0f0f0;
      }

      .card-header h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: #333;
      }

      .card-body {
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .divider {
        height: 1px;
        background: #f0f0f0;
        margin: 4px 0;
      }

      .section-subtitle {
        font-size: 13px;
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-group label {
        font-size: 13px;
        font-weight: 600;
        color: #555;
      }

      .form-group input[type="text"],
      .form-group input[type="number"] {
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        color: #333;
        background: #fff;
        transition: border-color 0.2s;
      }

      .form-group input:focus {
        outline: none;
        border-color: var(--brand-orange, #ea6a3d);
        box-shadow: 0 0 0 3px rgba(234, 106, 61, 0.12);
      }

      .inline-grid {
        display: grid;
        gap: 16px;
        grid-template-columns: 1fr 1fr;
      }

      .field-hint {
        margin: -8px 0 0;
        font-size: 12px;
        color: #999;
      }

      .btn-save-loyalty {
        border: none; padding: 10px 22px; font-size: 14px; font-weight: 600;
        border-radius: 8px; cursor: pointer;
        background: var(--brand-orange, #ea6a3d); color: #fff;
        transition: background 0.2s;
      }

      .btn-save-loyalty:hover:not(:disabled) {
        background: var(--brand-orange-strong, #d95b2f);
      }

      .btn-save-loyalty:disabled { opacity: 0.5; cursor: not-allowed; }

      .saved-msg { color: #28a745; font-weight: 600; font-size: 0.9rem; margin-left: 8px; }

      .form-actions { display: flex; align-items: center; margin-top: 4px; }

      /* Toggle switch */
      .toggle-row {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
      }

      .toggle-label {
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }

      .toggle-input {
        display: none;
      }

      .toggle-switch {
        position: relative;
        width: 44px;
        height: 24px;
        background: #ccc;
        border-radius: 12px;
        transition: background 0.2s;
        flex-shrink: 0;
      }

      .toggle-switch::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        background: #fff;
        border-radius: 50%;
        transition: transform 0.2s;
      }

      .toggle-input:checked + .toggle-switch {
        background: var(--brand-orange, #ea6a3d);
      }

      .toggle-input:checked + .toggle-switch::after {
        transform: translateX(20px);
      }

      /* Horários */
      .hours-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .hour-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px 12px;
        border-radius: 6px;
        background: #fafafa;
        transition: background 0.15s;
      }

      .hour-row:hover {
        background: #f5f5f5;
      }

      .hour-day-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        min-width: 150px;
      }

      .hour-day-toggle input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: var(--brand-orange, #ea6a3d);
        cursor: pointer;
      }

      .day-label {
        font-size: 14px;
        font-weight: 500;
        color: #444;
      }

      .hour-time-range {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .hour-time-range input[type="time"] {
        padding: 6px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        color: #333;
        background: #fff;
      }

      .hour-time-range input[type="time"]:focus {
        outline: none;
        border-color: var(--brand-orange, #ea6a3d);
      }

      .hour-separator {
        font-size: 13px;
        color: #888;
      }

      .hour-closed {
        font-size: 13px;
        color: #aaa;
        font-style: italic;
      }

      /* Payment checkboxes */
      .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 10px;
      }

      .checkbox-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border: 1px solid #eee;
        border-radius: 8px;
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
      }

      .checkbox-row:hover {
        border-color: #ddd;
        background: #fafafa;
      }

      .checkbox-row input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: var(--brand-orange, #ea6a3d);
        cursor: pointer;
      }

      .checkbox-label {
        font-size: 14px;
        font-weight: 500;
        color: #444;
        flex: 1;
      }

      .checkbox-icon {
        font-size: 18px;
        line-height: 1;
      }

      /* Upload images */
      .upload-grid {
        display: grid;
        gap: 20px;
        grid-template-columns: 1fr 1fr;
      }

      .upload-box {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .upload-label {
        font-size: 13px;
        font-weight: 600;
        color: #555;
      }

      .upload-preview {
        width: 100%;
        height: 120px;
        border: 2px dashed #ddd;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        transition: border-color 0.2s;
      }

      .upload-preview:hover {
        border-color: #bbb;
      }

      .upload-preview.has-image {
        border-style: solid;
        border-color: #ddd;
      }

      .upload-preview img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .upload-preview--wide img {
        object-fit: cover;
      }

      .upload-placeholder {
        font-size: 28px;
        color: #ccc;
        font-weight: 300;
      }

      .upload-input {
        font-size: 13px;
        color: #666;
      }

      .upload-input::file-selector-button {
        padding: 6px 14px;
        border: 1px solid #ddd;
        border-radius: 6px;
        background: #f9f9f9;
        color: #333;
        font-size: 13px;
        cursor: pointer;
        margin-right: 8px;
        transition: background 0.2s;
      }

      .upload-input::file-selector-button:hover {
        background: #eee;
      }

      .btn-remove {
        border: none;
        background: transparent;
        color: #dc3545;
        font-size: 13px;
        cursor: pointer;
        padding: 0;
        align-self: flex-start;
        font-weight: 500;
      }

      .btn-remove:hover {
        text-decoration: underline;
      }

      @media (max-width: 720px) {
        .inline-grid {
          grid-template-columns: 1fr;
        }

        .upload-grid {
          grid-template-columns: 1fr;
        }

        .checkbox-grid {
          grid-template-columns: 1fr 1fr;
        }

        .hour-day-toggle {
          min-width: 120px;
        }
      }

      @media (max-width: 480px) {
        .checkbox-grid {
          grid-template-columns: 1fr;
        }

        .hour-row {
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class AdminStoreSettingsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly storeSettingsService = inject(StoreSettingsService);
  private readonly http = inject(HttpClient);
  private readonly clerk = inject(ClerkService);

  readonly saving = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Loyalty settings
  loyaltyStampsNeeded = 10;
  loyaltyMinOrder = 0;
  loyaltyPrize = '1 produto grátis do cardápio';
  readonly loyaltySaving = signal(false);
  readonly loyaltySaved = signal(false);

  readonly logoPreview = signal<string | null>(null);
  readonly coverPreview = signal<string | null>(null);

  readonly DAY_LABELS = DAY_LABELS;

  readonly PAYMENT_OPTIONS = [
    { key: 'cash', label: 'Dinheiro', icon: '💵' },
    { key: 'pix', label: 'Pix', icon: '✨' },
    { key: 'creditCard', label: 'Cartão de Crédito', icon: '💳' },
    { key: 'debitCard', label: 'Cartão de Débito', icon: '🏦' },
    { key: 'mealVoucher', label: 'Vale Refeição', icon: '🍽️' },
  ] as const;

  readonly form = this.fb.nonNullable.group({
    storeOpen: [true],
    openingMessage: [''],
    closingMessage: [''],
    whatsappNumber: [''],
    addressStreet: [''],
    addressNumber: [''],
    neighborhood: [''],
    city: [''],
    zipCode: [''],
    referencePoint: [''],
    deliveryFee: [0],
    minimumOrderValue: [0],
    estimatedDeliveryTime: [''],
    businessHours: this.fb.array(
      this.buildHoursArray(),
    ),
    paymentMethods: this.fb.nonNullable.group({
      cash: [true],
      pix: [true],
      creditCard: [true],
      debitCard: [true],
      mealVoucher: [false],
    }),
    logoUrl: [''],
    coverUrl: [''],
  });

  get businessHours(): FormArray {
    return this.form.controls.businessHours;
  }

  private buildHoursArray() {
    return Array.from({ length: 7 }, (_, i) =>
      this.fb.nonNullable.group({
        dayOfWeek: [i],
        enabled: [i !== 1 && i !== 2],
        openTime: ['18:00'],
        closeTime: i >= 5 ? ['23:30'] : ['23:00'],
      }),
    );
  }

  ngOnInit(): void {
    this.storeSettingsService.getAdminStoreSettings().subscribe({
      next: (settings) => this.populateForm(settings),
      error: () => this.errorMessage.set('Não foi possível carregar as configurações.'),
    });

    this.carregarLoyaltySettings();
  }

  private carregarLoyaltySettings(): void {
    this.getToken().then((token) => {
      if (!token) return;

      this.http.get<any>(`${API_BASE_URL}/admin/loyalty/settings`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
      }).subscribe({
        next: (res) => {
          this.loyaltyStampsNeeded = res.stampsNeeded ?? 10;
          this.loyaltyMinOrder = res.minOrderAmount ?? 0;
          this.loyaltyPrize = res.prizeDescription ?? '1 produto grátis do cardápio';
        },
        error: () => {}
      });
    });
  }

  salvarLoyalty(): void {
    this.loyaltySaving.set(true);
    this.loyaltySaved.set(false);

    this.getToken().then((token) => {
      if (!token) {
        this.loyaltySaving.set(false);
        return;
      }

      this.http.put<any>(
        `${API_BASE_URL}/admin/loyalty/settings`,
        {
          stampsNeeded: this.loyaltyStampsNeeded,
          minOrderAmount: this.loyaltyMinOrder,
          prizeDescription: this.loyaltyPrize,
        },
        { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      ).subscribe({
        next: () => {
          this.loyaltySaved.set(true);
          this.loyaltySaving.set(false);
          setTimeout(() => this.loyaltySaved.set(false), 3000);
        },
        error: () => {
          this.loyaltySaving.set(false);
        }
      });
    });
  }

  private populateForm(settings: StoreSettingsResponse): void {
    this.form.patchValue({
      storeOpen: settings.storeOpen,
      openingMessage: settings.openingMessage,
      closingMessage: settings.closingMessage,
      whatsappNumber: settings.whatsappNumber,
      deliveryFee: settings.deliveryFee,
      minimumOrderValue: settings.minimumOrderValue,
      estimatedDeliveryTime: settings.estimatedDeliveryTime,
      addressStreet: settings.storeProfile?.addressStreet ?? '',
      addressNumber: settings.storeProfile?.addressNumber ?? '',
      neighborhood: settings.storeProfile?.neighborhood ?? '',
      city: settings.storeProfile?.city ?? '',
      zipCode: settings.storeProfile?.zipCode ?? '',
      referencePoint: settings.storeProfile?.referencePoint ?? '',
      logoUrl: settings.storeProfile?.logoUrl ?? '',
      coverUrl: settings.storeProfile?.coverUrl ?? '',
    });

    if (settings.storeProfile?.logoUrl) {
      this.logoPreview.set(settings.storeProfile.logoUrl);
    }
    if (settings.storeProfile?.coverUrl) {
      this.coverPreview.set(settings.storeProfile.coverUrl);
    }

    if (settings.paymentMethods) {
      this.form.controls.paymentMethods.patchValue(settings.paymentMethods);
    }

    if (settings.businessHours?.length === 7) {
      settings.businessHours.forEach((day, i) => {
        const group = this.businessHours.at(i);
        group.patchValue({
          enabled: day.enabled,
          openTime: day.openTime,
          closeTime: day.closeTime,
        });
      });
    }
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        this.logoPreview.set(dataUrl);
        this.form.controls.logoUrl.setValue(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoPreview.set(null);
    this.form.controls.logoUrl.setValue('');
  }

  onCoverSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        this.coverPreview.set(dataUrl);
        this.form.controls.coverUrl.setValue(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  removeCover(): void {
    this.coverPreview.set(null);
    this.form.controls.coverUrl.setValue('');
  }

  buscaCep(): void {
    const cep = this.form.controls.zipCode.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((r) => r.json())
      .then((data) => {
        if (data.erro) return;
        if (data.localidade) this.form.controls.city.setValue(data.localidade);
        if (data.bairro && !this.form.controls.neighborhood.value) {
          this.form.controls.neighborhood.setValue(data.bairro);
        }
        if (data.logradouro && !this.form.controls.addressStreet.value) {
          this.form.controls.addressStreet.setValue(data.logradouro);
        }
      })
      .catch(() => {});
  }

  private async getToken(): Promise<string | null> {
    return await this.clerk.getToken();
  }

  save(): void {
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
      estimatedDeliveryTime: value.estimatedDeliveryTime,
      businessHours: value.businessHours,
      paymentMethods: value.paymentMethods,
      storeProfile: {
        logoUrl: value.logoUrl,
        coverUrl: value.coverUrl,
        addressStreet: value.addressStreet,
        addressNumber: value.addressNumber,
        neighborhood: value.neighborhood,
        city: value.city,
        zipCode: value.zipCode,
        referencePoint: value.referencePoint,
      },
    };

    this.storeSettingsService.updateAdminStoreSettings(payload).subscribe({
      next: () => {
        this.successMessage.set('Configurações salvas com sucesso!');
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: () => {
        this.errorMessage.set('Erro ao salvar configurações. Tente novamente.');
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }
}
