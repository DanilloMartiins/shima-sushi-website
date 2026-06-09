import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../core/services/menu.service';
import { CategorySummaryResponse, CreateProductRequest, CustomizationGroupRequest, ProductResponse } from '../../core/models/menu.models';

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="products-page">
      <header class="page-header">
        <h1>Gerenciamento de Produtos</h1>
        <div class="header-actions">
          <button class="add-product-btn" (click)="abrirModal()">+ Adicionar Produto</button>
          <button
            class="bulk-delete-btn"
            [ngClass]="{ 'bulk-delete-active': modoSelecao }"
            (click)="modoSelecao ? excluirSelecionados() : alternarModoSelecao()"
          >
            {{ modoSelecao ? 'Excluir (' + selecionados.size + ')' : 'Excluir' }}
          </button>
          <button class="cancel-select-btn" *ngIf="modoSelecao" (click)="alternarModoSelecao()">Cancelar</button>
        </div>
      </header>

      <div class="loading" *ngIf="loading">
        <span>Carregando produtos...</span>
      </div>

      <div class="error" *ngIf="errorMsg">
        <span>{{ errorMsg }}</span>
      </div>

      <div class="table-container" *ngIf="!loading">
        <table>
          <thead>
            <tr>
              <th class="check-cell" *ngIf="modoSelecao">
                <input type="checkbox" (change)="selecionarTodos()" [checked]="selecionados.size === products.length && products.length > 0" />
              </th>
              <th>Imagem</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Disponível</th>
              <th>Destaque</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of products" [ngClass]="{ 'row-selected': selecionados.has(product.id) }">
              <td class="check-cell" *ngIf="modoSelecao">
                <input type="checkbox" [checked]="selecionados.has(product.id)" (change)="toggleSelecao(product.id)" />
              </td>
              <td class="image-cell">
                <img
                  *ngIf="product.imageUrl; else noImage"
                  [src]="product.imageUrl"
                  [alt]="product.name"
                  class="product-thumb"
                  loading="lazy"
                  (error)="product.imageUrl = null"
                />
                <ng-template #noImage>
                  <div class="no-image"></div>
                </ng-template>
              </td>
              <td>
                <div class="product-name">{{ product.name }}</div>
                <div class="product-desc">{{ product.description }}</div>
              </td>
              <td>
                <span class="category-badge">{{ product.category?.name }}</span>
              </td>
              <td class="price">{{ product.price | currency : 'BRL' }}</td>
              <td>
                <span
                  class="status-badge"
                  [ngClass]="product.available ? 'status-active' : 'status-inactive'"
                >
                  {{ product.available ? 'Sim' : 'Não' }}
                </span>
              </td>
              <td>
                <button
                  class="star-btn"
                  [ngClass]="{ 'star-active': product.isFeatured }"
                  (click)="toggleDestaque(product)"
                  [title]="product.isFeatured ? 'Remover destaque' : 'Marcar como destaque'"
                >
                  ★
                </button>
              </td>
              <td class="actions">
                <button class="action-btn edit-btn" (click)="editarProduto(product)">Editar</button>
                <button
                  class="action-btn toggle-btn"
                  [ngClass]="product.available ? 'toggle-off' : 'toggle-on'"
                  (click)="toggleDisponivel(product)"
                >
                  {{ product.available ? 'Desativar' : 'Ativar' }}
                </button>
              </td>
            </tr>
            <tr *ngIf="products.length === 0">
              <td [attr.colspan]="modoSelecao ? 8 : 7" class="empty-state">Nenhum produto encontrado</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de adicionar/editar produto -->
    <div class="modal-overlay" *ngIf="modalAberta" (click)="fecharModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ produtoEditando ? 'Editar Produto' : 'Novo Produto' }}</h2>
          <button class="modal-close" (click)="fecharModal()">&times;</button>
        </div>

        <div class="modal-body">
          <label class="form-group">
            <span>Nome do produto</span>
            <input type="text" [(ngModel)]="formData.name" placeholder="Ex: Combinado Salmão (20 peças)" />
          </label>

          <label class="form-group">
            <span>Descrição</span>
            <textarea
              [(ngModel)]="formData.description"
              placeholder="Descrição do produto"
              rows="3"
            ></textarea>
          </label>

          <div class="form-row">
            <label class="form-group">
              <span>Preço (R$)</span>
              <input type="number" [(ngModel)]="formData.price" step="0.01" min="0" placeholder="0.00" />
            </label>

            <label class="form-group">
              <span>Categoria</span>
              <select [(ngModel)]="formData.categoryId">
                <option [value]="null" disabled>Selecione...</option>
                <option *ngFor="let cat of categorias" [value]="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </label>
          </div>

          <label class="form-group">
            <span>Imagem do produto</span>
            <input type="file" (change)="onFileSelected($event)" accept="image/*" />
            <div class="image-preview" *ngIf="imagemPreview">
              <img [src]="imagemPreview" alt="Preview" />
              <button class="remove-image" (click)="removerImagem()">&times;</button>
            </div>
          </label>

          <label class="form-group checkbox-group">
            <input type="checkbox" [(ngModel)]="formData.isCustomizable" />
            <span>Produto Customizável (ex: Monte seu Prato)</span>
          </label>

          <div class="customize-section" *ngIf="formData.isCustomizable">
            <h3>Grupos de Opções</h3>
            <p class="customize-hint">Defina grupos como "Escolha a Proteína", "Adicionais", etc.</p>

            <div class="group-card" *ngFor="let group of formData.customizationGroups; let gi = index">
              <div class="group-header">
                <strong>{{ group.name || 'Novo Grupo' }}</strong>
                <button class="btn-remove-group" (click)="removerGrupo(gi)" type="button">&times;</button>
              </div>
              <div class="group-body">
                <div class="form-row">
                  <label class="form-group">
                    <span>Nome do grupo</span>
                    <input type="text" [(ngModel)]="group.name" placeholder="Ex: Escolha a Proteína" />
                  </label>
                </div>
                <div class="form-row group-limits">
                  <label class="form-group">
                    <span>Mínimo</span>
                    <input type="number" [(ngModel)]="group.minSelected" min="0" />
                  </label>
                  <label class="form-group">
                    <span>Máximo</span>
                    <input type="number" [(ngModel)]="group.maxSelected" min="1" />
                  </label>
                  <span class="group-badge obrigatorio" *ngIf="group.minSelected >= 1">OBRIGATÓRIO</span>
                  <span class="group-badge" *ngIf="group.maxSelected === 1 && group.minSelected === 0">OPCIONAL</span>
                </div>

                <div class="options-section">
                  <span class="options-label">Opções</span>
                  <div class="option-row" *ngFor="let opt of group.options; let oi = index">
                    <label class="form-group opt-field-name">
                      <span>Nome</span>
                      <input type="text" [(ngModel)]="opt.name" placeholder="Ex: Frango Empanado" />
                    </label>
                    <label class="form-group opt-field-price">
                      <span>Valor</span>
                      <input type="number" [(ngModel)]="opt.priceAddition" step="0.01" min="0" placeholder="R$ 0,00" />
                    </label>
                    <button class="btn-remove-option" (click)="removerOpcao(gi, oi)" type="button">&times;</button>
                  </div>
                  <button class="btn-add-option" (click)="adicionarOpcao(gi)" type="button">+ Adicionar opção</button>
                </div>
              </div>
            </div>

            <button class="btn-add-group" (click)="adicionarGrupo()" type="button">+ Adicionar grupo</button>
          </div>

        </div>

        <div class="modal-footer">
          <span class="form-error" *ngIf="formError">{{ formError }}</span>
          <button class="btn-cancel" (click)="fecharModal()" [disabled]="salvando">Cancelar</button>
          <button class="btn-save" (click)="salvarProduto()" [disabled]="salvando">
            {{ salvando ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100dvh;
        background-color: #f4f7fa;
      }

      .products-page {
        animation: fadeIn 0.3s ease-in-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
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

      .header-actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .add-product-btn {
        background-color: #27ae60;
        color: white;
        border: none;
        padding: 12px 20px;
        font-size: 15px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
        font-weight: 600;
      }

      .add-product-btn:hover {
        background-color: #219a52;
      }

      .bulk-delete-btn {
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 12px 20px;
        font-size: 15px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: background-color 0.2s;
      }

      .bulk-delete-btn:hover {
        background-color: #c0392b;
      }

      .bulk-delete-active {
        background-color: #c0392b;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
      }

      .star-btn {
        background: none;
        border: none;
        font-size: 22px;
        cursor: pointer;
        color: #ddd;
        transition: color 0.2s, transform 0.2s;
        line-height: 1;
        padding: 2px 6px;
      }

      .star-btn:hover {
        transform: scale(1.2);
      }

      .star-active {
        color: #f1c40f;
      }

      .cancel-select-btn {
        background-color: #f0f0f0;
        color: #555;
        border: none;
        padding: 12px 20px;
        font-size: 15px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: background-color 0.2s;
      }

      .cancel-select-btn:hover {
        background-color: #e0e0e0;
      }

      .loading {
        text-align: center;
        padding: 60px;
        color: #777;
        font-size: 16px;
      }

      .error {
        text-align: center;
        padding: 60px;
        color: #c0392b;
        font-size: 16px;
      }

      .table-container {
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 14px 16px;
        text-align: left;
        border-bottom: 1px solid #f0f0f0;
        vertical-align: middle;
      }

      thead th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #555;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      tbody tr:last-child td {
        border-bottom: none;
      }

      tbody tr:hover {
        background-color: #fafbfc;
      }

      .image-cell {
        width: 64px;
      }

      .product-thumb {
        width: 48px;
        height: 48px;
        object-fit: cover;
        border-radius: 6px;
        display: block;
      }

      .no-image {
        width: 48px;
        height: 48px;
        border-radius: 6px;
        background-color: #e8ecf0;
      }

      .product-name {
        font-weight: 600;
        color: #333;
        font-size: 14px;
        margin-bottom: 2px;
      }

      .product-desc {
        color: #888;
        font-size: 12px;
        max-width: 280px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .category-badge {
        display: inline-block;
        background-color: #eef2f7;
        color: #556;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      }

      .price {
        font-weight: 700;
        color: #27ae60;
        font-size: 15px;
        white-space: nowrap;
      }

      .status-badge {
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-active {
        background-color: #eaf7f0;
        color: #27ae60;
      }

      .status-inactive {
        background-color: #f8f9fa;
        color: #999;
      }

      .actions {
        display: flex;
        gap: 8px;
      }

      .action-btn {
        border: none;
        padding: 6px 12px;
        font-size: 13px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .edit-btn {
        background-color: #f0f0f0;
        color: #555;
      }

      .edit-btn:hover {
        background-color: #e0e0e0;
      }

      .toggle-btn {
        font-weight: 600;
      }

      .toggle-off {
        background-color: #ffe0e0;
        color: #c0392b;
      }

      .toggle-off:hover {
        background-color: #ffcaca;
      }

      .toggle-on {
        background-color: #e0f7e9;
        color: #27ae60;
      }

      .toggle-on:hover {
        background-color: #c8f0d9;
      }

      .check-cell {
        width: 40px;
        text-align: center;
      }

      .check-cell input[type='checkbox'] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .row-selected {
        background-color: #fff3e0 !important;
      }

      .empty-state {
        text-align: center;
        padding: 40px;
        color: #999;
        font-size: 14px;
      }

      /* Modal */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.15s ease;
      }

      .modal-content {
        background: white;
        border-radius: 12px;
        width: 520px;
        max-width: 90vw;
        max-height: 90dvh;
        -webkit-overflow-scrolling: touch;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px 0;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 20px;
        color: #333;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 28px;
        color: #999;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }

      .modal-close:hover {
        color: #333;
      }

      .modal-body {
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
      }

      .form-group span {
        font-size: 13px;
        font-weight: 600;
        color: #555;
      }

      .form-group input[type='text'],
      .form-group input[type='number'],
      .form-group textarea,
      .form-group select {
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        color: #333;
        background: #fafafa;
        transition: border-color 0.2s;
      }

      .form-group input:focus,
      .form-group textarea:focus,
      .form-group select:focus {
        outline: none;
        border-color: #3498db;
        background: white;
      }

      .form-group input[type='file'] {
        padding: 8px 0;
        font-size: 13px;
      }

      .form-row {
        display: flex;
        gap: 16px;
      }

      .image-preview {
        position: relative;
        width: 100px;
        margin-top: 4px;
      }

      .image-preview img {
        width: 100px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid #eee;
      }

      .remove-image {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 50%;
        width: 22px;
        height: 22px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .checkbox-group {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      .checkbox-group input[type='checkbox'] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        accent-color: var(--brand-orange-strong, #e67e22);
        appearance: auto;
      }

      .checkbox-group span {
        font-size: 14px;
        color: #555;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 12px;
        padding: 16px 24px 20px;
        border-top: 1px solid #eee;
      }

      .form-error {
        color: #e74c3c;
        font-size: 13px;
        margin-right: auto;
      }

      .btn-cancel {
        background: #f0f0f0;
        color: #555;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
      }

      .btn-cancel:hover {
        background: #e0e0e0;
      }

      .btn-save {
        background: #27ae60;
        color: white;
        border: none;
        padding: 10px 24px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }

      .btn-save:hover {
        background: #219a52;
      }

      .btn-save:disabled,
      .btn-cancel:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .customize-section {
        border-top: 1px solid #eee;
        padding-top: 16px;
      }
      .customize-section h3 {
        font-size: 16px;
        margin: 0 0 4px;
        color: #333;
      }
      .customize-hint {
        font-size: 13px;
        color: #888;
        margin: 0 0 16px;
      }
      .group-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        margin-bottom: 12px;
        overflow: hidden;
        background: #fafafa;
      }
      .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        background: #f0f0f0;
        border-bottom: 1px solid #ddd;
      }
      .group-header strong {
        font-size: 14px;
        color: #444;
      }
      .btn-remove-group {
        background: none;
        border: none;
        font-size: 20px;
        color: #e74c3c;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }
      .group-body {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .group-limits {
        align-items: center;
      }
      .group-limits .form-group input {
        width: 70px;
      }
      .group-badge {
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 4px;
        background: #ecf0f1;
        color: #7f8c8d;
        text-transform: uppercase;
      }
      .group-badge.obrigatorio {
        background: #ffeaa7;
        color: #d68910;
      }
      .options-section {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .options-label {
        font-size: 12px;
        font-weight: 600;
        color: #777;
        text-transform: uppercase;
      }
      .option-row {
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }
      .option-row .opt-field-name {
        flex: 1;
      }
      .option-row .opt-field-price {
        flex: none;
        width: 120px;
      }
      .option-row .opt-field-name span,
      .option-row .opt-field-price span {
        font-size: 12px;
        font-weight: 600;
        color: #777;
      }
      .option-row .opt-field-name input,
      .option-row .opt-field-price input {
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 13px;
      }
      .option-row .opt-field-price input {
        width: 100%;
      }
      .btn-remove-option {
        background: none;
        border: none;
        font-size: 18px;
        color: #e74c3c;
        cursor: pointer;
        padding: 0 4px;
      }
      .btn-add-option {
        background: none;
        border: 1px dashed #bbb;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 13px;
        color: #555;
        cursor: pointer;
        align-self: flex-start;
      }
      .btn-add-option:hover {
        background: #f5f5f5;
        border-color: #999;
      }
      .btn-add-group {
        background: none;
        border: 1px dashed #27ae60;
        border-radius: 8px;
        padding: 10px 16px;
        font-size: 14px;
        color: #27ae60;
        cursor: pointer;
        width: 100%;
        font-weight: 600;
      }
      .btn-add-group:hover {
        background: #f0fdf4;
      }
    `,
  ],
})
export class AdminProductsPageComponent implements OnInit {
  private menuService = inject(MenuService);

  products: ProductResponse[] = [];
  categorias: CategorySummaryResponse[] = [];
  loading = true;
  errorMsg: string | null = null;

  modalAberta = false;
  salvando = false;
  formError: string | null = null;
  produtoEditando: ProductResponse | null = null;

  arquivoImagem: File | null = null;
  imagemPreview: string | null = null;

  formData = {
    name: '',
    description: '',
    price: null as number | null,
    categoryId: null as number | null,
    available: true,
    isCustomizable: false,
    customizationGroups: [] as CustomizationGroupRequest[],
  };

  modoSelecao = false;
  selecionados = new Set<number>();

  ngOnInit() {
    this.carregarProdutos();
    this.carregarCategorias();
  }

  carregarProdutos() {
    this.loading = true;
    this.errorMsg = null;

    this.menuService.getAdminProducts().subscribe({
      next: (paged) => {
        this.products = paged.content;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = err.message ?? 'Erro ao carregar produtos';
        this.loading = false;
      },
    });
  }

  carregarCategorias() {
    this.menuService.getAdminCategories().subscribe((cats) => {
      this.categorias = cats;
    });
  }

  excluirProduto(produto: ProductResponse) {
    if (!confirm(`Tem certeza que deseja excluir "${produto.name}"?`)) return;

    this.menuService.deleteAdminProduct(produto.id).subscribe({
      next: () => this.carregarProdutos(),
      error: () => (this.errorMsg = 'Erro ao excluir produto'),
    });
  }

  toggleDestaque(produto: ProductResponse) {
    this.menuService.toggleFeaturedProduct(produto.id).subscribe({
      next: () => this.carregarProdutos(),
      error: (err) => {
        this.errorMsg = err.error?.message ?? err.message ?? 'Erro ao alternar destaque';
      },
    });
  }

  toggleDisponivel(produto: ProductResponse) {
    const groups: CustomizationGroupRequest[] = (produto.customizationGroups ?? []).map((g: any, gi: number) => ({
      id: g.id,
      name: g.name,
      minSelected: g.minSelected,
      maxSelected: g.maxSelected,
      displayOrder: gi,
      options: g.options.map((o: any, oi: number) => ({
        id: o.id,
        name: o.name,
        priceAddition: o.priceAddition,
        displayOrder: oi,
      })),
    }));

    const payload: CreateProductRequest = {
      name: produto.name,
      description: produto.description,
      price: produto.price,
      imageUrl: produto.imageUrl ?? '/assets/images/product_placeholder.png',
      available: !produto.available,
      categoryId: produto.category!.id,
      isCustomizable: produto.isCustomizable ?? false,
      customizationGroups: groups,
    };

    this.menuService.updateAdminProduct(produto.id, payload).subscribe({
      next: () => this.carregarProdutos(),
      error: () => (this.errorMsg = 'Erro ao alterar disponibilidade do produto'),
    });
  }

  alternarModoSelecao() {
    this.modoSelecao = !this.modoSelecao;
    if (!this.modoSelecao) {
      this.selecionados.clear();
    }
  }

  toggleSelecao(id: number) {
    if (this.selecionados.has(id)) {
      this.selecionados.delete(id);
    } else {
      this.selecionados.add(id);
    }
  }

  selecionarTodos() {
    if (this.selecionados.size === this.products.length) {
      this.selecionados.clear();
    } else {
      this.products.forEach((p) => this.selecionados.add(p.id));
    }
  }

  excluirSelecionados() {
    const ids = Array.from(this.selecionados);
    if (ids.length === 0) return;

    if (!confirm(`Tem certeza que deseja excluir ${ids.length} produto(s)?`)) return;

    this.menuService.deleteAdminProducts(ids).subscribe({
      next: () => {
        this.modoSelecao = false;
        this.selecionados.clear();
        this.carregarProdutos();
      },
      error: () => (this.errorMsg = 'Erro ao excluir produtos'),
    });
  }

  abrirModal() {
    this.produtoEditando = null;
    this.resetarFormulario();
    this.modalAberta = true;
  }

  editarProduto(produto: ProductResponse) {
    this.produtoEditando = produto;
    this.formData = {
      name: produto.name,
      description: produto.description,
      price: produto.price,
      categoryId: produto.category?.id ?? null,
      available: produto.available ?? true,
      isCustomizable: produto.isCustomizable ?? false,
      customizationGroups: (produto.customizationGroups ?? []).map(g => ({
        id: g.id,
        name: g.name,
        minSelected: g.minSelected,
        maxSelected: g.maxSelected,
        displayOrder: g.displayOrder,
        options: g.options.map(o => ({
          id: o.id,
          name: o.name,
          priceAddition: o.priceAddition,
          displayOrder: o.displayOrder,
        })),
      })),
    };
    this.arquivoImagem = null;
    this.imagemPreview = null;
    this.formError = null;
    this.modalAberta = true;
  }

  fecharModal() {
    this.modalAberta = false;
    this.salvando = false;
  }

  resetarFormulario() {
    this.formData = { name: '', description: '', price: null, categoryId: null, available: true, isCustomizable: false, customizationGroups: [] };
    this.arquivoImagem = null;
    this.imagemPreview = null;
    this.formError = null;
  }

  adicionarGrupo() {
    this.formData.customizationGroups.push({
      name: '',
      minSelected: 0,
      maxSelected: 1,
      displayOrder: this.formData.customizationGroups.length,
      options: [],
    });
  }

  removerGrupo(index: number) {
    this.formData.customizationGroups.splice(index, 1);
  }

  adicionarOpcao(groupIndex: number) {
    this.formData.customizationGroups[groupIndex].options.push({
      name: '',
      priceAddition: 0,
      displayOrder: this.formData.customizationGroups[groupIndex].options.length,
    });
  }

  removerOpcao(groupIndex: number, optionIndex: number) {
    this.formData.customizationGroups[groupIndex].options.splice(optionIndex, 1);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.arquivoImagem = input.files[0];
    const reader = new FileReader();
    reader.onload = () => (this.imagemPreview = reader.result as string);
    reader.readAsDataURL(this.arquivoImagem);
  }

  removerImagem() {
    this.arquivoImagem = null;
    this.imagemPreview = null;
  }

  salvarProduto() {
    this.formError = null;

    if (!this.formData.name?.trim()) {
      this.formError = 'Nome do produto é obrigatório';
      return;
    }
    if (!this.formData.description?.trim()) {
      this.formError = 'Descrição é obrigatória';
      return;
    }
    if (!this.formData.price || this.formData.price <= 0) {
      this.formError = 'Preço deve ser maior que zero';
      return;
    }
    if (!this.formData.categoryId) {
      this.formError = 'Selecione uma categoria';
      return;
    }

    this.salvando = true;

    const groups: CustomizationGroupRequest[] = this.formData.customizationGroups.map((g: any, gi: number) => ({
      id: g.id,
      name: g.name,
      minSelected: g.minSelected,
      maxSelected: g.maxSelected,
      displayOrder: gi,
      options: g.options.map((o: any, oi: number) => ({
        id: o.id,
        name: o.name,
        priceAddition: o.priceAddition ?? 0,
        displayOrder: oi,
      })),
    }));

    const payload: CreateProductRequest = {
      name: this.formData.name.trim(),
      description: this.formData.description.trim(),
      price: this.formData.price,
      imageUrl: this.produtoEditando?.imageUrl ?? '/assets/images/product_placeholder.png',
      available: this.formData.available,
      categoryId: this.formData.categoryId!,
      isCustomizable: this.formData.isCustomizable,
      customizationGroups: groups,
    };

    const request$ =
      this.produtoEditando != null
        ? this.menuService.updateAdminProduct(this.produtoEditando.id, payload)
        : this.menuService.createAdminProduct(payload);

    request$.subscribe({
      next: (produto) => {
        if (this.arquivoImagem) {
          this.menuService.uploadProductImage(produto.id, this.arquivoImagem).subscribe({
            next: () => {
              this.fecharModal();
              this.carregarProdutos();
            },
            error: () => {
              this.fecharModal();
              this.carregarProdutos();
            },
          });
        } else {
          this.fecharModal();
          this.carregarProdutos();
        }
      },
      error: (err) => {
        this.formError = err.error?.message ?? err.message ?? 'Erro ao salvar produto';
        this.salvando = false;
      },
    });
  }
}
