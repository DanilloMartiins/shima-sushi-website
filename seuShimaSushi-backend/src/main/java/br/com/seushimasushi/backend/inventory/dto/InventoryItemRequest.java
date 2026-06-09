package br.com.seushimasushi.backend.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InventoryItemRequest(
        @NotBlank(message = "Nome e obrigatorio")
        String name,

        @NotNull
        @Min(value = 0, message = "Quantidade nao pode ser negativa")
        Integer quantity,

        Integer minQuantity,

        @NotBlank(message = "Unidade e obrigatoria")
        String unit
) {
}
