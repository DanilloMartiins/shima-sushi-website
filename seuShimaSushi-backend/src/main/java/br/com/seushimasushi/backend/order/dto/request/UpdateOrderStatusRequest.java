package br.com.seushimasushi.backend.order.dto.request;

import br.com.seushimasushi.backend.order.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull(message = "Status e obrigatorio")
        OrderStatus status
) {
}
