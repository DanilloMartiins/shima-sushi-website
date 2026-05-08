package br.com.seushimasushi.backend.menu.dto.publicview;

import java.util.List;

public record PublicMenuCategoryResponse(
        Long id,
        String name,
        String description,
        List<PublicMenuProductResponse> products
) {
}
