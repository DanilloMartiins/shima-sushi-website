import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateProductRequest, ProductResponse } from '../../core/models/menu.models';
import { MenuService } from '../../core/services/menu.service';

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <section class="admin-grid">
      <article class="card form-card">
        <h2>{{ editingProductId() ? 'Editar produto' : 'Novo produto' }}</h2>

        <form [formGroup]="form" (ngSubmit)="save()">
          <label>
            Nome
            <input type="text" formControlName="name" />
          </label>

          <label>
            Descricao
            <textarea rows="3" formControlName="description"></textarea>
          </label>

          <label>
            Preco
            <input type="number" min="0" step="0.01" formControlName="price" />
          </label>

          <label>
            Categoria ID
            <input type="number" min="1" formControlName="categoryId" />
          </label>

          <label>
            URL da imagem
            <input type="url" formControlName="imageUrl" />
          </label>

          <div class="upload-row">
            <input type="file" (change)="onFileSelected($event)" accept="image/*" />
            <button type="button" class="ghost" (click)="uploadImage()" [disabled]="!selectedFile()">
              Upload imagem
            </button>
          </div>

          <label>
            Tag
            <input type="text" formControlName="tag" />
          </label>

          <label>
            Chamada
            <input type="text" formControlName="pitch" />
          </label>

          <p class="error" *ngIf="errorMessage()">{{ errorMessage() }}</p>

          <div class="actions">
            <button type="submit" [disabled]="form.invalid || saving()">
              <ng-container *ngIf="!saving(); else savingLabel">Salvar</ng-container>
              <ng-template #savingLabel>
                <span class="shima-loader">
                  <span class="shima-loader-icon" aria-hidden="true"></span>
                  Salvando...
                </span>
              </ng-template>
            </button>
            <button type="button" class="ghost" (click)="resetForm()">Limpar</button>
          </div>
        </form>
      </article>

      <article class="card">
        <h2>Produtos cadastrados</h2>

        <p *ngIf="loading()">
          <span class="shima-loader">
            <span class="shima-loader-icon" aria-hidden="true"></span>
            Carregando produtos...
          </span>
        </p>

        <table *ngIf="!loading()">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Preco</th>
              <th>Categoria</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of products(); trackBy: trackProduct">
              <td>{{ product.id }}</td>
              <td>{{ product.name }}</td>
              <td>{{ product.price | currency: 'BRL' }}</td>
              <td>{{ product.categoryId }}</td>
              <td>
                <button type="button" class="ghost" (click)="edit(product)">Editar</button>
                <button type="button" class="danger" (click)="remove(product)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </article>
    </section>
  `,
  styles: [
    `
      .admin-grid {
        display: grid;
        grid-template-columns: 0.95fr 1.05fr;
        gap: 1rem;
      }

      .card {
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 14px;
        background: rgba(8, 10, 16, 0.8);
        padding: 1rem;
      }

      form {
        display: grid;
        gap: 0.8rem;
      }

      label {
        display: grid;
        gap: 0.3rem;
      }

      input,
      textarea {
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(7, 9, 14, 0.65);
        color: #f7f9ff;
        padding: 0.5rem 0.6rem;
      }

      .upload-row {
        display: flex;
        gap: 0.6rem;
        align-items: center;
      }

      .actions {
        display: flex;
        gap: 0.6rem;
      }

      button {
        border: 0;
        border-radius: 999px;
        padding: 0.45rem 0.8rem;
        cursor: pointer;
      }

      button[type='submit'] {
        background: #f9bd44;
        color: #241b0f;
      }

      .ghost {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.25);
        color: #e8ecff;
      }

      .danger {
        background: rgba(231, 86, 86, 0.22);
        color: #ffb8b8;
      }

      .error {
        margin: 0;
        color: #ff9f9f;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0.45rem;
      }

      td:last-child {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      @media (max-width: 1020px) {
        .admin-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminProductsPageComponent implements OnInit {
  private readonly menuService = inject(MenuService);
  private readonly fb = inject(FormBuilder);

  readonly products = signal<ProductResponse[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly editingProductId = signal<number | null>(null);
  readonly selectedFile = signal<File | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    categoryId: [1, [Validators.required, Validators.min(1)]],
    imageUrl: [''],
    tag: [''],
    pitch: [''],
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const payload: CreateProductRequest = this.form.getRawValue();
    const productId = this.editingProductId();

    const request$ = productId
      ? this.menuService.updateAdminProduct(productId, payload)
      : this.menuService.createAdminProduct(payload);

    request$.subscribe({
      next: () => {
        this.loadProducts();
        this.resetForm();
      },
      error: () => {
        this.errorMessage.set('Nao foi possivel salvar o produto.');
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }

  edit(product: ProductResponse): void {
    this.editingProductId.set(product.id);
    this.form.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl ?? '',
      tag: product.tag ?? '',
      pitch: product.pitch ?? '',
    });
  }

  remove(product: ProductResponse): void {
    if (!confirm(`Excluir o produto "${product.name}"?`)) {
      return;
    }

    this.menuService.deleteAdminProduct(product.id).subscribe({
      next: () => this.loadProducts(),
      error: () => this.errorMessage.set('Nao foi possivel remover o produto.'),
    });
  }

  resetForm(): void {
    this.form.reset({
      name: '',
      description: '',
      price: 0,
      categoryId: 1,
      imageUrl: '',
      tag: '',
      pitch: '',
    });
    this.editingProductId.set(null);
    this.selectedFile.set(null);
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const selected = inputElement.files?.item(0) ?? null;
    this.selectedFile.set(selected);
  }

  uploadImage(): void {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.menuService.uploadProductImage(file).subscribe({
      next: (response) => {
        this.form.patchValue({ imageUrl: response.url });
      },
      error: () => {
        this.errorMessage.set('Falha ao enviar imagem.');
      },
    });
  }

  trackProduct(_index: number, product: ProductResponse): number {
    return product.id;
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.menuService.getAdminProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Nao foi possivel carregar produtos.');
        this.loading.set(false);
      },
    });
  }
}
