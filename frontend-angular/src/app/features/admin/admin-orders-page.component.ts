import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Order {
  id: string;
  customerName: string;
  date: Date;
  totalValue: number;
  status: 'Concluído' | 'Em Preparo' | 'Saiu para Entrega' | 'Cancelado';
}

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orders-page">
      <header class="page-header">
        <h1>Relatório de Pedidos</h1>
      </header>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID do Pedido</th>
              <th>Nome do Cliente</th>
              <th>Data</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders">
              <td>#{{ order.id.slice(0, 6) }}...</td>
              <td>{{ order.customerName }}</td>
              <td>{{ order.date | date : 'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ order.totalValue | currency : 'BRL' }}</td>
              <td>
                <span
                  class="status-badge"
                  [ngClass]="{
                    'status-completed': order.status === 'Concluído',
                    'status-preparing': order.status === 'Em Preparo',
                    'status-delivery': order.status === 'Saiu para Entrega',
                    'status-canceled': order.status === 'Cancelado'
                  }"
                  >{{ order.status }}</span
                >
              </td>
              <td class="actions">
                <button class="action-btn details-btn">Ver Detalhes</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    // Reutilizando os mesmos estilos do AdminProductsPageComponent para consistência
    `
      .orders-page {
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

      /* Cores para status de pedido */
      .status-completed {
        background-color: #eaf7f0;
        color: #28a745;
      }
      .status-preparing {
        background-color: #e6f3ff;
        color: #007bff;
      }
      .status-delivery {
        background-color: #fff8e1;
        color: #ffc107;
      }
      .status-canceled {
        background-color: #fbeae5;
        color: #dc3545;
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

      .details-btn {
        background-color: #f0f0f0;
        color: #333;
      }
      .details-btn:hover {
        background-color: #e0e0e0;
      }
    `,
  ],
})
export class AdminOrdersPageComponent {
  orders: Order[] = [
    {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      customerName: 'Carlos Silva',
      date: new Date(2026, 4, 21, 19, 30),
      totalValue: 97.5,
      status: 'Em Preparo',
    },
    {
      id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
      customerName: 'Mariana Oliveira',
      date: new Date(2026, 4, 21, 19, 15),
      totalValue: 120.0,
      status: 'Saiu para Entrega',
    },
    {
      id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef2',
      customerName: 'João Pereira',
      date: new Date(2026, 4, 20, 20, 0),
      totalValue: 75.0,
      status: 'Concluído',
    },
    {
      id: 'd4e5f6a7-b8c9-0123-4567-890abcdef3',
      customerName: 'Ana Costa',
      date: new Date(2026, 4, 20, 18, 45),
      totalValue: 55.5,
      status: 'Concluído',
    },
    {
      id: 'e5f6a7b8-c9d0-1234-5678-90abcdef4',
      customerName: 'Lucas Souza',
      date: new Date(2026, 4, 19, 21, 10),
      totalValue: 42.0,
      status: 'Cancelado',
    },
  ];
}
