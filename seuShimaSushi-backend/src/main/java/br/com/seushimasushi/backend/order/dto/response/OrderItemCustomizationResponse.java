package br.com.seushimasushi.backend.order.dto.response;

import java.math.BigDecimal;

public record OrderItemCustomizationResponse(
        Long groupId,
        String groupName,
        Long optionId,
        String optionName,
        BigDecimal priceAddition
) {}
