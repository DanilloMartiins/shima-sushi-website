package br.com.seushimasushi.backend.menu.dto.publicview;

import java.math.BigDecimal;
import java.util.List;

public record PublicMenuProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        Boolean isCustomizable,
        List<PublicCustomizationGroupResponse> customizationGroups
) {
}
