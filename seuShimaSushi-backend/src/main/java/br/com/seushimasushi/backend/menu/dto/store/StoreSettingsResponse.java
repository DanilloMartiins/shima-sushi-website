package br.com.seushimasushi.backend.menu.dto.store;

import java.math.BigDecimal;

public record StoreSettingsResponse(
        Integer id,
        Boolean storeOpen,
        String openingMessage,
        String closingMessage,
        String whatsappNumber,
        BigDecimal deliveryFee,
        BigDecimal minimumOrderValue
) {
}
