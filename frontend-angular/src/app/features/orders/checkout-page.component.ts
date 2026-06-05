import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { AddressService } from '../../core/services/address.service';
import { ClerkService } from '../../core/services/clerk.service';
import { CreateOrderRequest, DeliveryType, OrderResponse, PaymentMethod } from '../../core/models/order.models';
import { AddressResponse } from '../../core/models/address.models';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, RouterLink],
  template: `
    <section class="checkout-wrap">
      <div class="checkout-header">
        <h1>Finalizar Pedido</h1>
        <button class="btn-clear" (click)="clearCart()" *ngIf="cartItems().length > 0">
          Limpar Carrinho
        </button>
      </div>

      <div class="checkout-grid" *ngIf="cartItems().length > 0; else emptyCart">
        <form class="checkout-form" [formGroup]="form" (ngSubmit)="submit()">
          
          <div class="section-box">
            <h3>1. Como deseja receber?</h3>
            <div class="delivery-options">
              <label class="radio-card" [class.selected]="form.get('deliveryType')?.value === 'RETIRADA'">
                <input type="radio" formControlName="deliveryType" value="RETIRADA" />
                <span>Retirada na Loja</span>
              </label>
              <label class="radio-card" [class.selected]="form.get('deliveryType')?.value === 'ENTREGA'">
                <input type="radio" formControlName="deliveryType" value="ENTREGA" />
                <span>Entrega em Casa</span>
              </label>
            </div>

            <!-- Endereço de Entrega -->
            <div *ngIf="form.get('deliveryType')?.value === 'ENTREGA'" class="address-fields animate-fade">
              <div *ngIf="hasDefaultAddress() && !isEditingAddress(); else addressForm" class="default-address-alert">
                <p>O endereço de entrega é realmente este?</p>
                <div class="address-preview">
                  <strong>{{ defaultAddress()?.street }}, {{ defaultAddress()?.number }}</strong>
                  <span>{{ defaultAddress()?.neighborhood }} - {{ defaultAddress()?.city }}</span>
                </div>
                <button type="button" class="btn-change" (click)="startEditingAddress()">Mudar endereço</button>
              </div>

              <ng-template #addressForm>
                <div class="address-form-grid">
                  <div class="form-row">
                    <div class="form-group">
                      <label>CEP</label>
                      <input type="text" formControlName="zipCode" placeholder="00000-000" (blur)="onCepBlur()" />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Rua / Logradouro</label>
                      <input type="text" formControlName="street" placeholder="Ex: Av. Rui Barbosa" />
                    </div>
                    <div class="form-group small">
                      <label>Nº</label>
                      <input type="text" formControlName="number" placeholder="123" />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Bairro</label>
                      <input type="text" formControlName="neighborhood" placeholder="Ex: Centro" />
                    </div>
                    <div class="form-group">
                      <label>Cidade</label>
                      <input type="text" formControlName="city" readonly class="input-readonly" />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Complemento (Opcional)</label>
                    <input type="text" formControlName="complement" placeholder="Ex: Bloco A, Apto 10" />
                  </div>

                  <div class="form-group">
                    <label>Ponto de Referência (Opcional)</label>
                    <input type="text" formControlName="referencePoint" placeholder="Ex: Perto da farmácia" />
                  </div>
                </div>
                
                <div class="save-default-check" *ngIf="isEditingAddress() || !hasDefaultAddress()">
                   <label class="inline">
                     <input type="checkbox" formControlName="saveAsDefault" /> Salvar como endereço padrão?
                   </label>
                </div>
              </ng-template>
            </div>
          </div>

          <div class="section-box">
            <h3>2. Pagamento</h3>
            <select formControlName="paymentMethod">
              <option value="PIX">PIX - Cobrança antecipada</option>
              <option value="CARTAO_CREDITO">Cartão de Crédito (na entrega)</option>
              <option value="DINHEIRO">Dinheiro</option>
            </select>

            <!-- Campo de Troco -->
            <div *ngIf="form.get('paymentMethod')?.value === 'DINHEIRO'" class="change-fields animate-fade">
              <label class="inline">
                <input type="checkbox" formControlName="needsChange" /> Precisa de troco?
              </label>
              
              <div *ngIf="form.get('needsChange')?.value" class="form-group animate-fade">
                <label>Troco pra quanto?</label>
                <input type="number" formControlName="changeFor" placeholder="Ex: 50" />
              </div>
            </div>
          </div>

          <div class="section-box">
            <h3>3. Observações (Opcional)</h3>
            <textarea rows="2" formControlName="notes" placeholder="Ex: Sem cebolinha, trocar por..."></textarea>
          </div>

          <p class="error" *ngIf="errorMessage()">{{ errorMessage() }}</p>

          <button type="submit" class="btn-confirm" [disabled]="form.invalid || submitting()">
            {{ submitting() ? 'Enviando...' : 'Confirmar e Finalizar' }}
          </button>
        </form>

        <aside class="cart-summary">
          <h2>Resumo</h2>
          <ul>
            <li *ngFor="let item of cartItems()">
              <span>{{ item.quantity }}x {{ item.name }}</span>
              <strong>{{ item.quantity * item.price | currency: 'BRL' }}</strong>
            </li>
          </ul>
          <div class="totals">
            <p>Total: <strong>{{ cartService.totalPrice() | currency: 'BRL' }}</strong></p>
          </div>
        </aside>
      </div>

      <ng-template #emptyCart>
        <div class="empty-box">
          <p>Seu carrinho está vazio.</p>
          <a routerLink="/" class="btn-back">Voltar ao cardápio</a>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #fcfcfc;
      min-height: 100vh;
      padding-bottom: 4rem;
    }

    .checkout-wrap { 
      width: min(1100px, 100% - 2rem); 
      margin: 0 auto;
      padding-top: 3rem;
    }

    .checkout-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 2.5rem; 
    }

    .checkout-header h1 {
      font-size: 2.2rem;
      color: var(--brand-ink);
      margin: 0;
      letter-spacing: -0.02em;
    }
    
    .checkout-grid { 
      display: grid; 
      grid-template-columns: 1.4fr 0.6fr; 
      gap: 2.5rem; 
      align-items: start;
    }

    .section-box { 
      background: #fff; 
      padding: 2rem; 
      border-radius: 20px; 
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      margin-bottom: 2rem; 
      transition: transform 0.2s ease;
    }

    .section-box h3 {
      margin: 0 0 1.5rem;
      font-size: 1.25rem;
      color: var(--brand-ink);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .section-box h3::before {
      content: '';
      width: 4px;
      height: 20px;
      background: var(--brand-orange);
      border-radius: 10px;
    }
    
    .delivery-options { display: flex; gap: 1.2rem; margin-bottom: 1.5rem; }
    .radio-card { 
      flex: 1; 
      padding: 1.25rem; 
      border: 2px solid #f0f0f0; 
      border-radius: 16px; 
      cursor: pointer; 
      text-align: center; 
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .radio-card:hover { border-color: #e0e0e0; background: #fafafa; }
    .radio-card.selected { 
      border-color: var(--brand-orange); 
      background: rgba(234, 106, 61, 0.04); 
      color: var(--brand-orange-strong);
      box-shadow: 0 8px 16px rgba(234, 106, 61, 0.08);
    }
    .radio-card input { display: none; }

    .address-form-grid { display: grid; gap: 1.25rem; margin-top: 1.5rem; }
    .change-fields { 
      margin-top: 1.5rem; 
      padding: 1.5rem; 
      background: #fdfdfd; 
      border-radius: 16px; 
      border: 1px solid #eee; 
    }

    .default-address-alert { 
      background: #fff9f5; 
      padding: 1.5rem; 
      border-radius: 16px; 
      border: 1px solid #fee6d8; 
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .default-address-alert p { margin: 0; font-size: 0.9rem; color: #8a5a44; font-weight: 600; }
    .address-preview { margin: 0.5rem 0; }
    .address-preview strong { font-size: 1.1rem; color: var(--brand-ink); display: block; }
    .address-preview span { color: #666; font-size: 0.95rem; }
    
    .btn-change { 
      align-self: flex-start;
      background: #fff; border: 1px solid #fee6d8;
      color: var(--brand-orange-strong);
      padding: 0.35rem 0.8rem; border-radius: 8px;
      cursor: pointer; font-size: 0.85rem; font-weight: 600;
      line-height: 1.35; transition: all 0.2s;
    }
    .btn-change:hover { border-color: var(--brand-orange); background: var(--brand-orange); color: #fff; }

    .btn-clear { background: transparent; color: #ff4d4d; border: 0; padding: 0.35rem 0.8rem; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.85rem; line-height: 1.35; }
    .btn-clear:hover { background: #fff1f1; }

    .btn-confirm { 
      width: 100%; padding: 0.6rem;
      background: var(--brand-orange); color: #fff;
      border: none; border-radius: 8px;
      font-weight: 700; font-size: 0.95rem;
      cursor: pointer; line-height: 1.35;
      box-shadow: 0 8px 16px rgba(234, 106, 61, 0.18);
      transition: all 0.25s ease; margin-top: 1rem;
    }
    .btn-confirm:hover:not(:disabled) { filter: brightness(1.1); box-shadow: 0 10px 20px rgba(234, 106, 61, 0.25); }
    .btn-confirm:disabled { background: #ccc; cursor: not-allowed; box-shadow: none; }

    .form-row { display: flex; gap: 1.25rem; }
    .form-group { display: grid; gap: 0.5rem; flex: 1; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: #666; padding-left: 0.2rem; }
    .form-group.small { flex: 0.35; }
    
    input, select, textarea { 
      padding: 0.9rem 1.1rem; 
      border-radius: 14px; 
      border: 1.5px solid #eee; 
      width: 100%; 
      font-size: 1rem;
      transition: all 0.2s;
      background: #fafafa;
    }
    input:focus, select:focus, textarea:focus { 
      outline: none; 
      border-color: var(--brand-orange); 
      background: #fff;
      box-shadow: 0 0 0 4px rgba(234, 106, 61, 0.08);
    }
    .input-readonly { background: #f0f0f0; cursor: not-allowed; border-color: #e5e5e5; }
    
    .inline { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; font-size: 0.95rem; font-weight: 600; color: var(--brand-ink); }
    .inline input[type="checkbox"] { width: auto; height: 1.2rem; width: 1.2rem; cursor: pointer; }

    .cart-summary { 
      background: #fff; 
      padding: 2rem; 
      border-radius: 20px; 
      border: 1.5px solid var(--brand-orange); 
      height: fit-content; 
      position: sticky;
      top: 2rem;
    }
    .cart-summary h2 { margin: 0 0 1.5rem; font-size: 1.5rem; color: var(--brand-ink); }
    .cart-summary ul { list-style: none; padding: 0; margin: 1.5rem 0; display: grid; gap: 1rem; }
    .cart-summary li { display: flex; justify-content: space-between; font-size: 1rem; align-items: center; }
    .cart-summary li span { color: #555; }
    .cart-summary li strong { color: var(--brand-ink); font-weight: 600; }
    
    .totals { border-top: 2px dashed #eee; padding-top: 1.5rem; margin-top: 1.5rem; }
    .totals p { display: flex; justify-content: space-between; align-items: center; margin: 0; font-size: 1.1rem; font-weight: 500; }
    .totals strong { font-size: 1.6rem; color: var(--brand-orange-strong); font-weight: 800; }

    .error { color: #d32f2f; background: #fff5f5; padding: 1rem; border-radius: 12px; font-size: 0.9rem; font-weight: 600; margin-bottom: 1.5rem; border-left: 4px solid #d32f2f; }

    .empty-box { text-align: center; padding: 5rem 2rem; background: #fff; border-radius: 24px; border: 1px solid var(--brand-border); box-shadow: 0 4px 24px rgba(0,0,0,0.03); }
    .empty-box p { font-size: 1.2rem; color: #666; margin-bottom: 2rem; }
    .btn-back { display: inline-block; background: var(--brand-ink); color: #fff; text-decoration: none; padding: 0.35rem 0.8rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; line-height: 1.35; transition: all 0.2s; }
    .btn-back:hover { filter: brightness(1.2); }

    .animate-fade { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 900px) { 
      .checkout-grid { grid-template-columns: 1fr; }
      .cart-summary { position: static; order: -1; }
      .checkout-header h1 { font-size: 1.8rem; }
    }
  `]
})
export class CheckoutPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly cartService = inject(CartService);
  private readonly ordersService = inject(OrdersService);
  private readonly addressService = inject(AddressService);
  private readonly clerkService = inject(ClerkService);
  private readonly router = inject(Router);

  readonly cartItems = this.cartService.items;
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  
  readonly defaultAddress = signal<AddressResponse | null>(null);
  readonly hasDefaultAddress = computed(() => !!this.defaultAddress());
  readonly isEditingAddress = signal(false);

  readonly form = this.fb.nonNullable.group({
    deliveryType: this.fb.nonNullable.control<DeliveryType>('RETIRADA'),
    paymentMethod: this.fb.nonNullable.control<PaymentMethod>('PIX'),
    zipCode: ['', [Validators.pattern(/^\d{5}-?\d{3}$/)]],
    street: [''],
    number: [''],
    neighborhood: [''],
    city: ['Garanhuns'],
    complement: [''],
    referencePoint: [''],
    saveAsDefault: [false],
    needsChange: [false],
    changeFor: [null as number | null],
    notes: ['']
  });

  ngOnInit(): void {
    // Busca o endereço padrão do banco
    this.addressService.getDefaultAddress().subscribe(addr => {
      if (addr) {
        this.defaultAddress.set(addr);
        this.form.patchValue({
          street: addr.street,
          number: addr.number,
          neighborhood: addr.neighborhood,
          city: addr.city,
          complement: addr.complement,
          referencePoint: addr.referencePoint
        });
      }
    });

    // Se mudar o tipo para Entrega e não tiver endereço, já abre o form
    this.form.get('deliveryType')?.valueChanges.subscribe(type => {
      if (type === 'ENTREGA' && !this.hasDefaultAddress()) {
        this.isEditingAddress.set(true);
      }
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

  clearCart(): void {
    if (confirm('Deseja realmente limpar o carrinho?')) {
      this.cartService.clear();
    }
  }

  startEditingAddress(): void {
    this.isEditingAddress.set(true);
    this.form.patchValue({ zipCode: '', street: '', number: '', neighborhood: '', city: 'Garanhuns', complement: '', referencePoint: '' });
  }

  submit(): void {
    if (this.form.invalid) return;

    // Se o usuário digitou um novo endereço e pediu pra salvar como padrão
    if (this.form.get('deliveryType')?.value === 'ENTREGA' && this.form.get('saveAsDefault')?.value) {
      this.saveNewDefaultAddress();
    }

    this.sendOrder();
  }

  private saveNewDefaultAddress(): void {
    const val = this.form.getRawValue();
    this.addressService.saveAddress({
      street: val.street,
      number: val.number,
      neighborhood: val.neighborhood,
      city: val.city,
      zipCode: val.zipCode,
      complement: val.complement,
      referencePoint: val.referencePoint,
      isDefault: true
    }).subscribe();
  }

  private sendOrder(): void {
    this.submitting.set(true);
    const formValue = this.form.getRawValue();

    const fullAddressText = formValue.deliveryType === 'ENTREGA' 
      ? `${formValue.street}, ${formValue.number} - ${formValue.neighborhood}, ${formValue.city}`
      : undefined;

    const payload: CreateOrderRequest = {
      deliveryType: formValue.deliveryType,
      paymentMethod: formValue.paymentMethod,
      deliveryAddress: fullAddressText,
      notes: formValue.notes,
      items: this.cartItems().map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    this.ordersService.createOrder(payload).subscribe({
      next: (order) => {
        this.redirectToWhatsApp(order);
        this.cartService.clear();
        void this.router.navigateByUrl('/orders');
      },
      error: () => {
        this.errorMessage.set('Falha ao enviar pedido. Tente novamente.');
        this.submitting.set(false);
      }
    });
  }

  private redirectToWhatsApp(order: OrderResponse): void {
    const user = this.clerkService.user();
    const customerName = user?.fullName || 'Cliente';
    const customerPhone = user?.primaryPhoneNumber?.phoneNumber || 'Não informado';
    const customerCpf = user?.publicMetadata?.['cpf'] || 'Não informado';

    const date = new Date().toLocaleDateString('pt-BR');
    const paymentLabels: Record<PaymentMethod, string> = {
      PIX: 'Pix - Cobrança antecipada',
      CARTAO_CREDITO: 'Cartão de Crédito (na entrega)',
      DINHEIRO: 'Dinheiro'
    };

    let msg = `*Pedido:* #${order.id}\n`;
    msg += `*Data:* ${date}\n\n`;
    msg += `*Cliente:* ${customerName}\n`;
    msg += `*CPF:* ${customerCpf}\n`;
    msg += `*Telefone:* ${customerPhone}\n`;
    msg += `------------------------------\n`;

    this.cartItems().forEach(item => {
      msg += `*${item.name.toUpperCase()}*\n`;
      msg += `   ${item.quantity} UN x R$ ${item.price.toFixed(2).replace('.', ',')} = R$ ${(item.quantity * item.price).toFixed(2).replace('.', ',')}\n`;
    });

    msg += `------------------------------\n`;
    msg += `*SUBTOTAL:* R$ ${this.cartService.totalPrice().toFixed(2).replace('.', ',')}\n\n`;
    
    let paymentStr = paymentLabels[order.paymentMethod];
    const formValue = this.form.getRawValue();
    if (order.paymentMethod === 'DINHEIRO' && formValue.needsChange) {
      paymentStr += ` (Troco para R$ ${formValue.changeFor})`;
    }
    
    msg += `*Pagamento:* ${paymentStr}\n`;
    msg += order.deliveryType === 'ENTREGA' ? `*Entrega no endereço:* ${order.deliveryAddress}` : `*Retirada na loja*`;

    if (order.notes) {
      msg += `\n\n*Obs:* ${order.notes}`;
    }

    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/5527996518265?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
  }
}
