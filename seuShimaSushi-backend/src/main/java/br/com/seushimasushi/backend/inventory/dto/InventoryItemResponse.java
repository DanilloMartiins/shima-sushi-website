package br.com.seushimasushi.backend.inventory.dto;

import java.time.LocalDateTime;

public record InventoryItemResponse(
        Long id,
        String name,
        Integer quantity,
        Integer minQuantity,
        String unit,
        String createdBy,
        boolean abaixoDoMinimo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
