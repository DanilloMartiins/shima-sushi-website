package br.com.seushimasushi.backend.menu.dto.publicview;

import java.math.BigDecimal;

public record PublicCustomizationOptionResponse(
        Long id,
        String name,
        BigDecimal priceAddition,
        int displayOrder
) {}
