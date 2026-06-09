package br.com.seushimasushi.backend.menu.dto.admin;

import java.math.BigDecimal;

public record CustomizationOptionResponse(
        Long id,
        String name,
        BigDecimal priceAddition,
        int displayOrder
) {}
