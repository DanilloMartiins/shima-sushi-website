import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'Ativo' | 'Inativo';
}

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="products-page">
      <header class="page-header">
        <h1>Gerenciamento de Produtos</h1>
        <button class="add-product-btn">Adicionar Novo Produto</button>
      </header>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome do Produto</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of products">
              <td>{{ product.name }}</td>
              <td>{{ product.category }}</td>
              <td>{{ product.price | currency : 'BRL' }}</td>
              <td>
                <span
                  class="status-badge"
                  [ngClass]="{
                    'status-active': product.status === 'Ativo',
                    'status-inactive': product.status === 'Inativo'
                  }"
                  >{{ product.status }}</span
                >
              </td>
              <td class="actions">
                <button class="action-btn edit-btn">Editar</button>
                <button class="action-btn toggle-btn">
                  {{ product.status === 'Ativo' ? 'Desativar' : 'Ativar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
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
      }

      .add-product-btn {
        background-color: #3498db;
        color: white;
        border: none;
        padding: 12px 20px;
        font-size: 16px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .add-product-btn:hover {
        background-color: #2980b9;
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
        padding: 16px 20px;
        text-align: left;
        border-bottom: 1px solid #f0f0f0;
      }

      thead th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #555;
      }

      tbody tr:last-child td {
        border-bottom: none;
      }

      tbody tr:hover {
        background-color: #f5f5f5;
      }

      .status-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .status-active {
        background-color: #eaf7f0;
        color: #28a745;
      }

      .status-inactive {
        background-color: #f8f9fa;
        color: #6c757d;
      }

      .actions {
        display: flex;
        gap: 10px;
      }

      .action-btn {
        border: none;
        padding: 8px 12px;
        font-size: 14px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .edit-btn {
        background-color: #f0f0f0;
        color: #333;
      }
      .edit-btn:hover {
        background-color: #e0e0e0;
      }

      .toggle-btn {
        background-color: #fff0f0;
        color: #c0392b;
      }
      .toggle-btn:hover {
        background-color: #fad4d4;
      }
    `,
  ],
})
export class AdminProductsPageComponent {
  products: Product[] = [
    {
      id: '1',
      name: 'Combinado Salmão (20 peças)',
      category: 'Combinados',
      price: 65.0,
      status: 'Ativo',
    },
    {
      id: '2',
      name: 'Temaki Salmão Completo',
      category: 'Temakis',
      price: 32.5,
      status: 'Ativo',
    },
    {
      id: '3',
      name: 'Hot Roll (10 unidades)',
      category: 'Quentes',
      price: 28.0,
      status: 'Ativo',
    },
    {
      id: '4',
      name: 'Shimeji na Manteiga',
      category: 'Entradas',
      price: 35.0,
      status: 'Inativo',
    },
    {
      id: '5',
      name: 'Refrigerante Lata',
      category: 'Bebidas',
      price: 6.0,
      status: 'Ativo',
    },
  ];
}
