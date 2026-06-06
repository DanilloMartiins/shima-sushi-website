package br.com.seushimasushi.backend.menu.dto.store;

import java.math.BigDecimal;
import java.util.List;

public record StoreSettingsResponse(
        Integer id,
        Boolean storeOpen,
        String openingMessage,
        String closingMessage,
        String whatsappNumber,
        BigDecimal deliveryFee,
        BigDecimal minimumOrderValue,
        String estimatedDeliveryTime,
        List<BusinessHoursDayDto> businessHours,
        PaymentMethodsConfigDto paymentMethods,
        StoreProfileDto storeProfile
) {
}
