import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, concat, distinctUntilChanged, interval, of, retry, startWith, switchMap, take, takeWhile } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import {
  CreateOrderRequest,
  OrderResponse,
  OrderStatus,
  PagedResponse,
  UpdateOrderStatusRequest,
} from '../models/order.models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);

  private readonly ordersEndpoint = `${API_BASE_URL}/orders`;
  private readonly adminOrdersEndpoint = `${API_BASE_URL}/admin/orders`;

  createOrder(payload: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.ordersEndpoint, payload);
  }

  getMyOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.ordersEndpoint}/me`);
  }

  cancelMyOrder(orderId: number, reason: string): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(
      `${this.ordersEndpoint}/${orderId}/cancel`,
      { reason },
    );
  }

  // Busca o status atual de um pedido especifico sem cache
  getPedidoStatus(orderId: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.ordersEndpoint}/${orderId}`);
  }

  // Faz polling do status do pedido com backoff progressivo:
  // - Primeiros 30s: polling a cada 3s (10 iteracoes)
  // - Depois: polling a cada 10s pra reduzir carga na API
  // - O startWith faz a primeira chamada ser imediata
  // - Para automaticamente quando o pedido for COMPLETED ou CANCELLED
  watchPedidoStatus(orderId: number): Observable<OrderResponse | null> {
    const rapido = interval(3000).pipe(take(10));
    const lento = interval(10000);

    return concat(rapido, lento).pipe(
      startWith(0),
      switchMap(() => {
        return this.getPedidoStatus(orderId).pipe(
          retry(2),
          catchError((err) => {
            console.error(`Erro ao buscar status do pedido ${orderId}:`, err);
            return of(null);
          }),
        );
      }),
      distinctUntilChanged((prev, curr) => prev?.status === curr?.status),
      takeWhile(
        (order) =>
          order !== null &&
          order.status !== 'COMPLETED' &&
          order.status !== 'CANCELLED',
        true,
      ),
    );
  }

  getAdminOrders(page = 0, size = 20): Observable<PagedResponse<OrderResponse>> {
    return this.http.get<PagedResponse<OrderResponse>>(this.adminOrdersEndpoint, {
      params: { page: page.toString(), size: size.toString() },
    });
  }

  updateOrderStatus(orderId: number, status: OrderStatus): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(
      `${this.adminOrdersEndpoint}/${orderId}/status`,
      { status } satisfies UpdateOrderStatusRequest,
    );
  }
}
