import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { StoreSettingsService } from '../../core/services/store-settings.service';
import { CreateOrderRequest, DeliveryType, OrderResponse, PaymentMethod } from '../../core/models/order.models';
import { StoreSettingsResponse } from '../../core/models/store.models';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <section class="checkout-wrap">
      <h1>Checkout</h1>
      <p>Finalize seu pedido no sistema e envie no WhatsApp, se quiser, depois da confirmacao.</p>

      <div class="checkout-grid" *ngIf="cartItems().length > 0; else emptyCart">
        <form class="checkout-form" [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Nome
            <input type="text" formControlName="customerName" />
          </label>

          <label>
            Telefone
            <input type="tel" formControlName="phone" />
          </label>

          <label>
            Pedido sera
            <select formControlName="deliveryType">
              <option value="RETIRADA">Retirada</option>
              <option value="ENTREGA">Entrega</option>
            </select>
          </label>

          <label>
            Forma de pagamento
            <select formControlName="paymentMethod">
              <option value="PIX">PIX</option>
              <option value="CARTAO_CREDITO">Cartao de credito</option>
              <option value="DINHEIRO">Dinheiro</option>
            </select>
          </label>

          <label class="inline" *ngIf="form.controls.paymentMethod.value === 'DINHEIRO'">
            <input type="checkbox" formControlName="needChange" /> Precisa de troco?
          </label>

          <label *ngIf="form.controls.needChange.value && form.controls.paymentMethod.value === 'DINHEIRO'">
            Troco para quanto
            <input type="number" formControlName="changeValue" min="0" step="0.01" />
          </label>

          <ng-container *ngIf="form.controls.deliveryType.value === 'ENTREGA'">
            <label>
              Endereco
              <input type="text" formControlName="address" />
            </label>

            <label>
              Numero
              <input type="text" formControlName="houseNumber" />
            </label>

            <label>
              Complemento
              <input type="text" formControlName="complement" />
            </label>

            <label>
              Bairro
              <input type="text" formControlName="neighborhood" />
            </label>
          </ng-container>

          <label>
            Observacao do pedido
            <textarea rows="3" formControlName="orderNote"></textarea>
          </label>

          <p class="error" *ngIf="errorMessage()">{{ errorMessage() }}</p>

          <button type="submit" [disabled]="form.invalid || submitting()">
            <ng-container *ngIf="!submitting(); else sendingOrderLabel">Confirmar pedido</ng-container>
            <ng-template #sendingOrderLabel>
              <span class="shima-loader">
                <span class="shima-loader-icon" aria-hidden="true"></span>
                Enviando pedido...
              </span>
            </ng-template>
          </button>
        </form>

        <aside class="cart-summary">
          <h2>Resumo do carrinho</h2>

          <ul>
            <li *ngFor="let item of cartItems(); trackBy: trackByProductId">
              <span>{{ item.quantity }}x {{ item.name }}</span>
              <strong>{{ item.quantity * item.price | currency: 'BRL' }}</strong>
            </li>
          </ul>

          <div class="totals">
            <p>Itens: <strong>{{ cartService.totalItems() }}</strong></p>
            <p>Total: <strong>{{ cartService.totalPrice() | currency: 'BRL' }}</strong></p>
          </div>

          <section class="order-success" *ngIf="lastOrder() as order">
            <h3>Pedido #{{ order.id }} confirmado</h3>
            <p>Status inicial: {{ statusLabel(order.status) }}</p>
            <a *ngIf="whatsappLink()" [href]="whatsappLink()" target="_blank" rel="noopener noreferrer"
              >Enviar no WhatsApp</a
            >
          </section>
        </aside>
      </div>

      <ng-template #emptyCart>
        <p class="empty-cart">Seu carrinho esta vazio. Volte ao cardapio para adicionar itens.</p>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .checkout-wrap h1 {
        margin: 0;
      }

      .checkout-wrap > p {
        color: var(--brand-muted);
      }

      .checkout-grid {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 1rem;
      }

      .checkout-form,
      .cart-summary {
        border: 1px solid var(--brand-border);
        background: #fff;
        border-radius: 14px;
        padding: 1rem;
        box-shadow: var(--shadow-sm);
      }

      .checkout-form {
        display: grid;
        gap: 0.8rem;
      }

      label {
        display: grid;
        gap: 0.3rem;
        color: var(--brand-ink);
      }

      .inline {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      input,
      select,
      textarea {
        border-radius: 10px;
        border: 1px solid var(--brand-border);
        background: #fff;
        color: var(--brand-ink);
        padding: 0.55rem 0.65rem;
      }

      button {
        border: 0;
        border-radius: 999px;
        padding: 0.6rem 0.9rem;
        font-weight: 700;
        cursor: pointer;
        background: var(--brand-orange);
        color: #fff;
      }

      .error {
        margin: 0;
        color: #ff9f9f;
      }

      .cart-summary ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0.5rem;
      }

      .cart-summary li {
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .totals {
        margin-top: 0.9rem;
        border-top: 1px dashed rgba(255, 255, 255, 0.2);
        padding-top: 0.75rem;
      }

      .order-success {
        margin-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        padding-top: 0.9rem;
      }

      .order-success a {
        color: var(--brand-orange-strong);
        text-decoration: none;
      }

      .empty-cart {
        border: 1px dashed rgba(255, 255, 255, 0.24);
        border-radius: 12px;
        padding: 1rem;
      }

      @media (max-width: 960px) {
        .checkout-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CheckoutPageComponent {
  private readonly fb = inject(FormBuilder);
  readonly cartService = inject(CartService);
  private readonly ordersService = inject(OrdersService);
  private readonly storeSettingsService = inject(StoreSettingsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly cartItems = this.cartService.items;
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly lastOrder = signal<OrderResponse | null>(null);
  readonly storeSettings = signal<StoreSettingsResponse | null>(null);

  readonly whatsappLink = computed<string | null>(() => {
    const order = this.lastOrder();
    const settings = this.storeSettings();

    if (!order || !settings?.whatsappNumber) {
      return null;
    }

    const text = [
      `Pedido #${order.id}`,
      `Cliente: ${order.customerName}`,
      `Itens: ${order.totalItems}`,
      `Total: R$ ${order.totalPrice.toFixed(2)}`,
    ].join('\n');

    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
  });

  readonly form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    deliveryType: this.fb.nonNullable.control<DeliveryType>('RETIRADA'),
    paymentMethod: this.fb.nonNullable.control<PaymentMethod>('PIX'),
    needChange: this.fb.nonNullable.control(false),
    changeValue: this.fb.control<number | null>(null),
    address: this.fb.nonNullable.control(''),
    houseNumber: this.fb.nonNullable.control(''),
    complement: this.fb.nonNullable.control(''),
    neighborhood: this.fb.nonNullable.control(''),
    orderNote: this.fb.nonNullable.control(''),
  });

  constructor() {
    this.storeSettingsService
      .getPublicStoreSettings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (settings) => this.storeSettings.set(settings),
      });

    this.form.controls.deliveryType.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((deliveryType) => {
        this.applyDeliveryValidators(deliveryType);
      });

    this.form.controls.paymentMethod.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((paymentMethod) => {
        this.applyPaymentValidators(paymentMethod, this.form.controls.needChange.value);
      });

    this.form.controls.needChange.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((needChange) => {
        this.applyPaymentValidators(this.form.controls.paymentMethod.value, needChange);
      });

    this.applyDeliveryValidators(this.form.controls.deliveryType.value);
    this.applyPaymentValidators(
      this.form.controls.paymentMethod.value,
      this.form.controls.needChange.value,
    );
  }

  submit(): void {
    if (this.form.invalid || this.cartItems().length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.submitting.set(true);

    const formValue = this.form.getRawValue();
    const payload: CreateOrderRequest = {
      customerName: formValue.customerName,
      phone: formValue.phone,
      deliveryType: formValue.deliveryType,
      paymentMethod: formValue.paymentMethod,
      needChange: formValue.needChange,
      changeValue: formValue.needChange ? formValue.changeValue : null,
      address: formValue.deliveryType === 'ENTREGA' ? formValue.address : '',
      houseNumber: formValue.deliveryType === 'ENTREGA' ? formValue.houseNumber : '',
      complement: formValue.deliveryType === 'ENTREGA' ? formValue.complement : '',
      neighborhood: formValue.deliveryType === 'ENTREGA' ? formValue.neighborhood : '',
      orderNote: formValue.orderNote,
      items: this.cartItems().map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    this.ordersService.createOrder(payload).subscribe({
      next: (order) => {
        this.lastOrder.set(order);
        this.cartService.clear();
      },
      error: () => {
        this.errorMessage.set('Nao foi possivel concluir seu pedido agora.');
      },
      complete: () => {
        this.submitting.set(false);
      },
    });
  }

  trackByProductId(_index: number, item: { productId: number }): number {
    return item.productId;
  }

  statusLabel(status: OrderResponse['status']): string {
    const labels: Record<OrderResponse['status'], string> = {
      CREATED: 'Criado',
      CONFIRMED: 'Confirmado',
      PREPARING: 'Em preparo',
      OUT_FOR_DELIVERY: 'Saiu para entrega',
      COMPLETED: 'Concluido',
      CANCELLED: 'Cancelado',
    };

    return labels[status];
  }

  private applyDeliveryValidators(deliveryType: DeliveryType): void {
    const addressControl = this.form.controls.address;
    const houseNumberControl = this.form.controls.houseNumber;
    const neighborhoodControl = this.form.controls.neighborhood;

    if (deliveryType === 'ENTREGA') {
      addressControl.setValidators([Validators.required]);
      houseNumberControl.setValidators([Validators.required]);
      neighborhoodControl.setValidators([Validators.required]);
    } else {
      addressControl.clearValidators();
      houseNumberControl.clearValidators();
      neighborhoodControl.clearValidators();
      this.form.patchValue(
        {
          address: '',
          houseNumber: '',
          complement: '',
          neighborhood: '',
        },
        { emitEvent: false },
      );
    }

    addressControl.updateValueAndValidity({ emitEvent: false });
    houseNumberControl.updateValueAndValidity({ emitEvent: false });
    neighborhoodControl.updateValueAndValidity({ emitEvent: false });
  }

  private applyPaymentValidators(paymentMethod: PaymentMethod, needChange: boolean): void {
    const changeValueControl = this.form.controls.changeValue;

    if (paymentMethod !== 'DINHEIRO') {
      this.form.patchValue(
        {
          needChange: false,
          changeValue: null,
        },
        { emitEvent: false },
      );
      changeValueControl.clearValidators();
      changeValueControl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    if (needChange) {
      changeValueControl.setValidators([Validators.required, Validators.min(0.01)]);
    } else {
      changeValueControl.clearValidators();
      this.form.patchValue({ changeValue: null }, { emitEvent: false });
    }

    changeValueControl.updateValueAndValidity({ emitEvent: false });
  }
}
