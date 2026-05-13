import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClerkService } from '../../core/services/clerk.service';
import { AddressService } from '../../core/services/address.service';
import { AddressResponse } from '../../core/models/address.models';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="profile-container">
      <div class="clerk-section">
        <div id="clerk-user-profile"></div>
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
    
    .btn-add, .btn-save { background: var(--brand-orange); color: #fff; border: none; padding: 0.8rem 1.5rem; border-radius: 99px; cursor: pointer; font-weight: bold; }
    .btn-edit { background: white; color: var(--brand-orange-strong); border: 1px solid var(--brand-orange-strong); padding: 0.6rem 1rem; border-radius: 99px; cursor: pointer; }
    .btn-cancel, .btn-delete { background: transparent; color: var(--brand-muted); border: 1px solid var(--brand-border); padding: 0.6rem 1rem; border-radius: 99px; cursor: pointer; }
    .btn-delete:hover { background: #fff1f1; color: #ff4d4d; border-color: #ff4d4d; }

    @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProfilePageComponent implements OnInit {
  private readonly clerk = inject(ClerkService);
  private readonly addressService = inject(AddressService);
  private readonly fb = inject(FormBuilder);

  readonly defaultAddress = signal<AddressResponse | null>(null);
  readonly showForm = signal(false);
  readonly loading = signal(false);
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
    this.loadAddress();
  }

  loadAddress(): void {
    this.addressService.getDefaultAddress().subscribe({
      next: (addr) => this.defaultAddress.set(addr),
    });
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

  removeAddress(id: number): void {
    if (!confirm('Deseja realmente remover este endereço?')) return;
    
    this.addressService.deleteAddress(id).subscribe({
      next: () => this.defaultAddress.set(null)
    });
  }
}
