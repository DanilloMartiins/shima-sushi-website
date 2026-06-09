package br.com.seushimasushi.backend.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateOrderItemRequest(
        @NotNull(message = "Produto e obrigatorio")
        Long productId,

        @NotNull(message = "Quantidade e obrigatoria")
        @Min(value = 1, message = "Quantidade deve ser maior que zero")
        Integer quantity,

        @Valid
        List<ItemCustomization> customizations
) {
}
