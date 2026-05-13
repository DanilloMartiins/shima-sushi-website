import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { AddressService } from '../../core/services/address.service';
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
                <div class="form-group">
                  <label>Endereço Completo</label>
                  <input type="text" formControlName="fullAddress" placeholder="Rua, Número, Bairro" />
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
              <option value="PIX">PIX</option>
              <option value="CARTAO_CREDITO">Cartão de Crédito (na entrega)</option>
              <option value="DINHEIRO">Dinheiro</option>
            </select>
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
    .checkout-wrap { width: min(1100px, 100% - 2rem); margin: 2rem auto; }
    .checkout-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    
    .checkout-grid { display: grid; grid-template-columns: 1.4fr 0.6fr; gap: 2rem; }
    .section-box { background: #fff; padding: 1.5rem; border-radius: 15px; border: 1px solid var(--brand-border); margin-bottom: 1.5rem; }
    
    .delivery-options { display: flex; gap: 1rem; margin-top: 1rem; }
    .radio-card { flex: 1; padding: 1rem; border: 2px solid var(--brand-border); border-radius: 12px; cursor: pointer; text-align: center; font-weight: bold; }
    .radio-card.selected { border-color: var(--brand-orange); background: rgba(234, 106, 61, 0.05); color: var(--brand-orange-strong); }
    .radio-card input { display: none; }

    .default-address-alert { background: #fdf6f2; padding: 1rem; border-radius: 12px; border: 1px solid #f9d8c6; }
    .address-preview { margin: 0.8rem 0; display: grid; }
    
    .btn-change { background: transparent; border: 1px solid var(--brand-orange); color: var(--brand-orange-strong); padding: 0.4rem 1rem; border-radius: 99px; cursor: pointer; font-size: 0.85rem; }
    .btn-clear { background: #fff; color: #ff4d4d; border: 1px solid #ff4d4d; padding: 0.5rem 1rem; border-radius: 99px; cursor: pointer; }
    .btn-confirm { width: 100%; padding: 1rem; background: var(--brand-orange); color: #fff; border: none; border-radius: 99px; font-weight: bold; font-size: 1.1rem; cursor: pointer; }

    .form-group { display: grid; gap: 0.4rem; margin-top: 1rem; }
    input, select, textarea { padding: 0.8rem; border-radius: 10px; border: 1px solid var(--brand-border); width: 100%; }
    .inline { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }

    .cart-summary { background: #fff; padding: 1.5rem; border-radius: 15px; border: 1px solid var(--brand-border); height: fit-content; }
    .cart-summary ul { list-style: none; padding: 0; margin: 1rem 0; display: grid; gap: 0.8rem; }
    .cart-summary li { display: flex; justify-content: space-between; font-size: 0.95rem; }
    .totals { border-top: 1px dashed var(--brand-border); padding-top: 1rem; font-size: 1.2rem; }

    .empty-box { text-align: center; padding: 4rem; background: #fff; border-radius: 20px; border: 1px solid var(--brand-border); }
    .btn-back { display: inline-block; margin-top: 1rem; background: var(--brand-ink); color: #fff; text-decoration: none; padding: 0.8rem 2rem; border-radius: 99px; }

    .animate-fade { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    @media (max-width: 800px) { .checkout-grid { grid-template-columns: 1fr; } }
  `]
})
export class CheckoutPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly cartService = inject(CartService);
  private readonly ordersService = inject(OrdersService);
  private readonly addressService = inject(AddressService);
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
    fullAddress: [''],
    saveAsDefault: [false],
    notes: ['']
  });

  ngOnInit(): void {
    // Busca o endereço padrão do banco
    this.addressService.getDefaultAddress().subscribe(addr => {
      if (addr) {
        this.defaultAddress.set(addr);
        this.form.patchValue({
          fullAddress: `${addr.street}, ${addr.number} - ${addr.neighborhood}, ${addr.city}`
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

  clearCart(): void {
    if (confirm('Deseja realmente limpar o carrinho?')) {
      this.cartService.clear();
    }
  }

  startEditingAddress(): void {
    this.isEditingAddress.set(true);
    this.form.patchValue({ fullAddress: '' });
  }

  cancelEdit(): void {
    if (this.hasDefaultAddress()) {
      const addr = this.defaultAddress()!;
      this.isEditingAddress.set(false);
      this.form.patchValue({
        fullAddress: `${addr.street}, ${addr.number} - ${addr.neighborhood}, ${addr.city}`
      });
    } else {
      this.form.patchValue({ deliveryType: 'RETIRADA' });
    }
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
    const fullText = this.form.get('fullAddress')?.value || '';
    const parts = fullText.split(',');
    
    this.addressService.saveAddress({
      street: parts[0]?.trim() || 'Não informado',
      number: parts[1]?.trim() || 'SN',
      neighborhood: 'Não informado',
      city: 'Garanhuns',
      zipCode: '00000000',
      isDefault: true
    }).subscribe();
  }

  private sendOrder(): void {
    this.submitting.set(true);
    const formValue = this.form.getRawValue();

    const payload: CreateOrderRequest = {
      deliveryType: formValue.deliveryType,
      paymentMethod: formValue.paymentMethod,
      deliveryAddress: formValue.deliveryType === 'ENTREGA' ? formValue.fullAddress : undefined,
      notes: formValue.notes,
      items: this.cartItems().map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    this.ordersService.createOrder(payload).subscribe({
      next: (order) => {
        alert('Pedido realizado com sucesso!');
        this.cartService.clear();
        void this.router.navigateByUrl('/orders');
      },
      error: () => {
        this.errorMessage.set('Falha ao enviar pedido. Tente novamente.');
        this.submitting.set(false);
      }
    });
  }
}
