package br.com.seushimasushi.backend.loyalty.dto.response;

import java.math.BigDecimal;

public record LoyaltySettingsResponse(
    Integer stampsNeeded,
    String prizeDescription,
    BigDecimal minOrderAmount,
    Boolean active
) {}
