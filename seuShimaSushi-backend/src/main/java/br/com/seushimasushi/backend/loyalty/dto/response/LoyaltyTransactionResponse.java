package br.com.seushimasushi.backend.loyalty.dto.response;

import java.time.LocalDateTime;

public record LoyaltyTransactionResponse(
    Long id,
    String type,
    Long orderId,
    String description,
    LocalDateTime createdAt
) {}
