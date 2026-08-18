package br.com.seushimasushi.backend.order.dto.request;

import br.com.seushimasushi.backend.order.model.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateOrderStatusRequest(
        @NotNull(message = "Status e obrigatorio")
        OrderStatus status,

        // Motivo/observacao usada no cancelamento (opcional)
        @Size(max = 500, message = "Nota deve ter no maximo 500 caracteres")
        String note
) {
}
