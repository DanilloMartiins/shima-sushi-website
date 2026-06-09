package br.com.seushimasushi.backend.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryExitRequest(
        @NotNull
        @Min(value = 1, message = "Quantidade deve ser maior que zero")
        Integer quantity,

        String reason
) {
}
