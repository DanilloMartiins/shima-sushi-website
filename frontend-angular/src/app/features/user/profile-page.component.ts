import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ClerkService } from '../../core/services/clerk.service';
import { AddressService } from '../../core/services/address.service';
import { AddressResponse } from '../../core/models/address.models';
import { API_BASE_URL } from '../../core/constants/api.constants';

interface LoyaltyTransaction {
  id: number;
  type: string;
  orderId: number | null;
  description: string;
  createdAt: string;
}

interface LoyaltyCard {
  id: number;
  stamps: number;
  stampsNeeded: number;
  prizeDescription: string;
  transactions: LoyaltyTransaction[];
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="profile-container">
      <div class="clerk-section">
        <div id="clerk-user-profile"></div>
      </div>

      <div class="phone-section">
        <h2>Telefone para Contato</h2>
        <p class="description">Opcional. Será usado para o entregador entrar em contato.</p>
        <div class="phone-input-row">
          <input
            type="tel"
            #phoneInput
            [value]="phone()"
            placeholder="(DDD) 99999-9999"
            class="phone-input"
          />
          <button (click)="salvarPhone(phoneInput.value)" class="btn-save-phone" [disabled]="phoneSaving()">
            {{ phoneSaving() ? 'Salvando...' : 'Salvar' }}
          </button>
          <span *ngIf="phoneSaved()" class="phone-saved-msg">Salvo!</span>
        </div>
      </div>

      <div class="loyalty-section">
        <h2>Cartão Fidelidade</h2>
        <p class="description">A cada pedido confirmado você ganha um selo. Complete o cartão para resgatar o prêmio!</p>

        @if (loyaltyLoading()) {
          <p class="loyalty-loading">Carregando seu cartão...</p>
        } @else if (loyaltyCard()) {
          <div class="stamps-bar">
            @for (stamp of gerarSelos(loyaltyCard()!); track $index) {
              <div
                class="stamp"
                [class.stamp--filled]="stamp.preenchido"
                [class.stamp--empty]="!stamp.preenchido"
                [title]="stamp.tooltip"
              >
                <span class="stamp-icon" [class.stamp-icon--empty]="!stamp.preenchido" aria-hidden="true"></span>
                @if (stamp.tooltip) {
                  <div class="stamp-tooltip">
                    <div class="tooltip-order-id">Pedido #{{ stamp.transaction?.orderId }}</div>
                    <div class="tooltip-status">Concluído</div>
                    <div class="tooltip-date">{{ stamp.transaction?.createdAt | date:'dd/MM/yyyy' }}</div>
                  </div>
                }
              </div>
            }
          </div>
          <div class="stamps-info">
            {{ loyaltyCard()!.stamps }}/{{ loyaltyCard()!.stampsNeeded }} selos
            &mdash; Prêmio: {{ loyaltyCard()!.prizeDescription }}
          </div>
        } @else {
          <p class="loyalty-empty">Você ainda não tem selos. Faça um pedido confirmado e comece a juntar!</p>
        }
      </div>

      <div class="address-section">
        <h2>Meu Endereço de Entrega</h2>
        <p class="description">Cadastre ou altere seu endereço para entregas.</p>

        <div *ngIf="defaultAddress() as addr; else noAddress" [hidden]="showForm()" class="address-card">
          <div class="address-info">
            <strong>{{ addr.street }}, {{ addr.number }}</strong>
            <span>{{ addr.neighborhood }} - {{ addr.city }}</span>
            <small *ngIf="addr.complement">{{ addr.complement }}</small>
            <span class="tag-default" *ngIf="addr.isDefault">Endereço Padrão</span>
          </div>
          <div class="card-actions">
            <button (click)="editAddress(addr)" class="btn-edit">Alterar</button>
            <button (click)="removeAddress(addr.id)" class="btn-delete">Remover</button>
          </div>
        </div>

        <ng-template #noAddress>
          <div *ngIf="!showForm()" class="no-address-box">
            <p>Você ainda não tem um endereço cadastrado.</p>
            <button (click)="showForm.set(true)" class="btn-add">Adicionar Endereço</button>
          </div>
        </ng-template>

        <form *ngIf="showForm()" [formGroup]="form" (ngSubmit)="save()" class="address-form">
          <h3>{{ editingId ? 'Alterar Endereço' : 'Novo Endereço' }}</h3>
          
          <div class="form-row">
            <div class="input-group">
              <label>CEP</label>
              <input type="text" formControlName="zipCode" placeholder="00000-000" (blur)="onCepBlur()" />
            </div>
          </div>

          <div class="form-row">
            <div class="input-group">
              <label>Rua / Logradouro</label>
              <input type="text" formControlName="street" placeholder="Ex: Av. Rui Barbosa" />
            </div>
            <div class="input-group small">
              <label>Nº</label>
              <input type="text" formControlName="number" placeholder="123" />
            </div>
          </div>
          
          <div class="form-row">
            <div class="input-group">
              <label>Bairro</label>
              <input type="text" formControlName="neighborhood" placeholder="Ex: Centro" />
            </div>
            <div class="input-group">
              <label>Cidade</label>
              <input type="text" formControlName="city" readonly class="input-readonly" />
            </div>
          </div>

          <div class="input-group">
            <label>Complemento (Opcional)</label>
            <input type="text" formControlName="complement" placeholder="Ex: Bloco A, Apto 10" />
          </div>

          <div class="input-group">
            <label>Ponto de Referência (Opcional)</label>
            <input type="text" formControlName="referencePoint" placeholder="Ex: Perto da farmácia" />
          </div>

          <div class="form-actions">
            <button type="button" (click)="cancelEdit()" class="btn-cancel">Cancelar</button>
            <button type="submit" [disabled]="form.invalid || loading()" class="btn-save">
              {{ loading() ? 'Salvando...' : 'Confirmar Endereço' }}
            </button>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: [`
    .profile-container { width: min(1000px, 100% - 2rem); margin: 2rem auto; display: grid; gap: 3rem; }
    h2, h3 { color: var(--brand-ink); margin-bottom: 0.5rem; }
    .description { color: var(--brand-muted); margin-bottom: 1.5rem; font-size: 0.95rem; }

    .address-section {
      background: #fff; padding: 2rem; border-radius: 20px;
      border: 1px solid var(--brand-border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    .address-card {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.5rem; background: rgba(234, 106, 61, 0.05);
      border-radius: 15px; border: 1px solid var(--brand-orange-strong);
    }

    .address-info { display: grid; gap: 0.25rem; }
    .card-actions { display: flex; gap: 0.5rem; }
    
    .tag-default { 
      background: var(--brand-orange-strong); color: #fff; font-size: 0.7rem; 
      padding: 0.2rem 0.6rem; border-radius: 99px; width: fit-content; margin-top: 0.5rem;
    }

    .no-address-box { text-align: center; padding: 2rem; border: 2px dashed var(--brand-border); border-radius: 15px; }

    .address-form { display: grid; gap: 1.2rem; margin-top: 1rem; animation: slideIn 0.3s ease; }
    .form-row { display: flex; gap: 1rem; }
    .input-group { display: grid; gap: 0.4rem; flex: 1; }
    .input-group.small { flex: 0.3; }
    label { font-size: 0.85rem; font-weight: 700; color: var(--brand-muted); }
    
    input { 
      padding: 0.8rem; border-radius: 10px; 
      border: 1px solid var(--brand-border); font-size: 1rem; width: 100%;
    }
    input:focus { border-color: var(--brand-orange); outline: none; }
    .input-readonly { background: #f9f9f9; cursor: not-allowed; }

    .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
    
    .btn-add, .btn-save { background: var(--brand-orange); color: #fff; border: none; border-radius: 8px; padding: 0.35rem 0.8rem; cursor: pointer; font-weight: 700; font-size: 0.85rem; line-height: 1.35; }
    .btn-edit { background: white; color: var(--brand-orange-strong); border: 1px solid var(--brand-orange-strong); border-radius: 8px; padding: 0.35rem 0.8rem; cursor: pointer; font-size: 0.85rem; line-height: 1.35; }
    .btn-cancel, .btn-delete { background: transparent; color: var(--brand-muted); border: 1px solid var(--brand-border); border-radius: 8px; padding: 0.35rem 0.8rem; cursor: pointer; font-size: 0.85rem; line-height: 1.35; }
    .btn-delete:hover { background: #fff1f1; color: #ff4d4d; border-color: #ff4d4d; }

    .phone-section {
      background: #fff; padding: 2rem; border-radius: 20px;
      border: 1px solid var(--brand-border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    .phone-input-row {
      display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
    }

    .phone-input {
      padding: 0.8rem; border-radius: 10px;
      border: 1px solid var(--brand-border); font-size: 1rem; flex: 1; max-width: 280px;
    }

    .phone-input:focus { border-color: var(--brand-orange); outline: none; }

    .btn-save-phone {
      background: var(--brand-orange); color: #fff; border: none; border-radius: 8px;
      padding: 0.6rem 1.2rem; cursor: pointer; font-weight: 700; font-size: 0.85rem;
    }

    .btn-save-phone:disabled { opacity: 0.6; cursor: not-allowed; }

    .phone-saved-msg { color: #28a745; font-weight: 600; font-size: 0.9rem; animation: fadeIn 0.2s ease; }

    .loyalty-section {
      background: #fff; padding: 2rem; border-radius: 20px;
      border: 1px solid var(--brand-border); box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    .loyalty-loading, .loyalty-empty { color: var(--brand-muted); font-size: 0.95rem; }

    .stamps-bar { display: flex; gap: 10px; flex-wrap: wrap; }

    .stamp {
      position: relative;
      width: 44px; height: 44px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: default;
      transition: transform 0.15s;
    }
    .stamp:hover { transform: scale(1.15); }
    .stamp--filled { background: var(--brand-orange); box-shadow: 0 2px 6px rgba(234, 106, 61, 0.3); }
    .stamp--empty { background: #e9ecef; }

    .stamp-icon {
      position: relative;
      width: 20px; height: 11px;
      display: inline-block;
    }
    .stamp-icon::before {
      content: '';
      position: absolute;
      left: 0; top: 0;
      width: 15px; height: 11px;
      border-radius: 50% 50% 45% 55% / 55% 55% 45% 45%;
      background: radial-gradient(circle at 32% 42%, #1a1a2e 0 1.5px, #fff 1.5px);
      transform: rotate(-8deg);
    }
    .stamp-icon::after {
      content: '';
      position: absolute;
      right: -2px; top: 50%;
      width: 7px; height: 5px;
      border: 2px solid #fff;
      border-left: none;
      border-radius: 0 50% 50% 0;
      transform: translateY(-50%);
    }
    .stamp-icon--empty { opacity: 0.45; }

    .stamp-tooltip {
      display: none;
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: #1a1a2e; color: #fff;
      padding: 8px 12px; border-radius: 8px;
      font-size: 12px; white-space: nowrap;
      z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      line-height: 1.5;
    }
    .stamp-tooltip::after {
      content: '';
      position: absolute;
      top: 100%; left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: #1a1a2e;
    }
    .stamp:hover .stamp-tooltip { display: block; }
    .tooltip-order-id { font-weight: 600; }
    .tooltip-status { color: #4caf50; }
    .tooltip-date { color: #aaa; }

    .stamps-info { font-size: 13px; color: #666; margin-top: 12px; }

    @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProfilePageComponent implements OnInit {
  private readonly clerk = inject(ClerkService);
  private readonly addressService = inject(AddressService);
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  readonly defaultAddress = signal<AddressResponse | null>(null);
  readonly showForm = signal(false);
  readonly loading = signal(false);
  readonly phone = signal('');
  readonly phoneSaving = signal(false);
  readonly phoneSaved = signal(false);
  readonly loyaltyCard = signal<LoyaltyCard | null>(null);
  readonly loyaltyLoading = signal(true);
  editingId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    street: ['', [Validators.required]],
    number: ['', [Validators.required]],
    neighborhood: ['', [Validators.required]],
    city: ['Garanhuns', [Validators.required]],
    complement: [''],
    referencePoint: [''],
    isDefault: [true]
  });

  ngOnInit(): void {
    this.clerk.mountUserProfile('clerk-user-profile');

    const user = this.clerk.user();
    if (user?.primaryPhoneNumber?.phoneNumber) {
      this.phone.set(user.primaryPhoneNumber.phoneNumber);
    }

    this.loadAddress();
    this.carregarLoyaltyCard();
  }

  loadAddress(): void {
    this.addressService.getDefaultAddress().subscribe({
      next: (addr) => this.defaultAddress.set(addr),
    });
  }

  carregarLoyaltyCard(): void {
    this.clerk.getToken().then((token) => {
      if (!token) {
        this.loyaltyLoading.set(false);
        return;
      }

      this.http.get<{ card: LoyaltyCard | null }>(
        `${API_BASE_URL}/loyalty/card`,
        { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      ).subscribe({
        next: (res) => {
          this.loyaltyCard.set(res.card);
          this.loyaltyLoading.set(false);
        },
        error: () => this.loyaltyLoading.set(false)
      });
    });
  }

  gerarSelos(card: LoyaltyCard): { preenchido: boolean; tooltip: string; transaction: LoyaltyTransaction | null }[] {
    const selos: { preenchido: boolean; tooltip: string; transaction: LoyaltyTransaction | null }[] = [];
    const earned = card.transactions.filter(t => t.type === 'EARNED');

    for (let i = 0; i < card.stampsNeeded; i++) {
      const transaction = earned[i] || null;
      selos.push({
        preenchido: i < card.stamps,
        tooltip: transaction && transaction.orderId ? `Pedido #${transaction.orderId}` : '',
        transaction
      });
    }
    return selos;
  }

  onCepBlur(): void {
    const cep = this.form.get('zipCode')?.value;
    if (cep && cep.length >= 8) {
      this.addressService.lookupCep(cep).subscribe(data => {
        if (!data.erro) {
          this.form.patchValue({
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade
          });
        }
      });
    }
  }

  editAddress(addr: AddressResponse): void {
    this.editingId = addr.id;
    this.form.patchValue({
      zipCode: '', // CEP não era salvo antes, usuário preenche agora
      street: addr.street,
      number: addr.number,
      neighborhood: addr.neighborhood,
      city: addr.city,
      complement: addr.complement,
      referencePoint: addr.referencePoint,
      isDefault: addr.isDefault
    });
    this.showForm.set(true);
  }

  cancelEdit(): void {
    this.showForm.set(false);
    this.editingId = null;
    this.form.reset({ city: 'Garanhuns', isDefault: true });
  }

  save(): void {
    if (this.form.invalid) return;
    this.loading.set(true);

    this.addressService.saveAddress(this.form.getRawValue(), this.editingId ?? undefined).subscribe({
      next: (saved) => {
        this.defaultAddress.set(saved);
        this.showForm.set(false);
        this.editingId = null;
        this.form.reset({ city: 'Garanhuns', isDefault: true });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  async salvarPhone(phoneValue: string): Promise<void> {
    this.phoneSaving.set(true);
    this.phoneSaved.set(false);

    const token = await this.clerk.getToken();
    if (!token) {
      this.phoneSaving.set(false);
      return;
    }

    this.http.put<{ mensagem: string }>(
      `${API_BASE_URL}/loyalty/phone`,
      { phone: phoneValue },
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: () => {
        this.phone.set(phoneValue);
        this.phoneSaved.set(true);
        this.phoneSaving.set(false);
        setTimeout(() => this.phoneSaved.set(false), 3000);
      },
      error: () => this.phoneSaving.set(false)
    });
  }

  removeAddress(id: number): void {
    if (!confirm('Deseja realmente remover este endereço?')) return;
    
    this.addressService.deleteAddress(id).subscribe({
      next: () => this.defaultAddress.set(null)
    });
  }
}
