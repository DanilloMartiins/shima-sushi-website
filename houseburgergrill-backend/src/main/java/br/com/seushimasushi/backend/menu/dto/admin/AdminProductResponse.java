package br.com.seushimasushi.backend.menu.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        Boolean available,
        CategorySummaryResponse category,
        Instant createdAt,
        Instant updatedAt
) {
}
