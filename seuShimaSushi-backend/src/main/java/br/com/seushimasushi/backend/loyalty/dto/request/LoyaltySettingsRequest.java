package br.com.seushimasushi.backend.loyalty.dto.request;

import java.math.BigDecimal;

public record LoyaltySettingsRequest(
    Integer stampsNeeded,
    String prizeDescription,
    BigDecimal minOrderAmount
) {}
