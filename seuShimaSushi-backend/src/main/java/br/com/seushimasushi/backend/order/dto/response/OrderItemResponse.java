package br.com.seushimasushi.backend.order.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record OrderItemResponse(
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal,
        List<OrderItemCustomizationResponse> customizations
) {
}
