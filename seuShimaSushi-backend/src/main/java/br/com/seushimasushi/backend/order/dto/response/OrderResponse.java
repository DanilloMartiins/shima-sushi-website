package br.com.seushimasushi.backend.order.dto.response;

import br.com.seushimasushi.backend.order.model.DeliveryType;
import br.com.seushimasushi.backend.order.model.OrderStatus;
import br.com.seushimasushi.backend.order.model.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        OrderStatus status,
        PaymentMethod paymentMethod,
        DeliveryType deliveryType,
        String deliveryAddress,
        String notes,
        BigDecimal totalAmount,
        BigDecimal totalPrice, // Adicionado para bater com o front
        Integer totalItems,    // Adicionado para bater com o front
        String customerName,   // Adicionado para facilitar exibição no admin
        Instant createdAt,
        Instant updatedAt,
        CustomerSummaryResponse customer,
        List<OrderItemResponse> items
) {
}
