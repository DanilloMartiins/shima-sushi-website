package br.com.seushimasushi.backend.order.dto.request;

import br.com.seushimasushi.backend.order.model.DeliveryType;
import br.com.seushimasushi.backend.order.model.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequest(
        @NotNull(message = "Forma de pagamento e obrigatoria")
        PaymentMethod paymentMethod,

        @NotNull(message = "Tipo de entrega e obrigatorio")
        DeliveryType deliveryType,

        @Size(max = 500, message = "Endereco deve ter no maximo 500 caracteres")
        String deliveryAddress,

        @Size(max = 500, message = "Observacoes devem ter no maximo 500 caracteres")
        String notes,

        @NotEmpty(message = "Pedido deve ter ao menos 1 item")
        List<@Valid CreateOrderItemRequest> items
) {
}
