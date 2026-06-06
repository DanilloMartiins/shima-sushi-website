import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

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
