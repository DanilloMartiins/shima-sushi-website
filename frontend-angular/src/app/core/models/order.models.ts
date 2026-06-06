export type DeliveryType = 'RETIRADA' | 'ENTREGA';
export type PaymentMethod = 'PIX' | 'CARTAO_CREDITO' | 'DINHEIRO';
export type OrderStatus =
  | 'CREATED'
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  deliveryAddress?: string;
  notes?: string;
  items: CreateOrderItemRequest[];
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface OrderResponse {
  id: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryType: DeliveryType;
  deliveryAddress?: string | null;
  notes?: string | null;
  totalAmount: number;
  totalPrice: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    clerkId: string;
  };
  customerName?: string;
  items: OrderItemResponse[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
