package br.com.seushimasushi.backend.menu.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        Boolean available,
        Boolean isFeatured,
        Boolean isCustomizable,
        CategorySummaryResponse category,
        Instant createdAt,
        Instant updatedAt,
        List<CustomizationGroupResponse> customizationGroups
) {
}
