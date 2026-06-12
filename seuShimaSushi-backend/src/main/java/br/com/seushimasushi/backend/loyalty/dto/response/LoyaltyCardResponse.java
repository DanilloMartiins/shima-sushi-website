package br.com.seushimasushi.backend.loyalty.dto.response;

import java.util.List;

public record LoyaltyCardResponse(
    Long id,
    Integer stamps,
    Integer stampsNeeded,
    String prizeDescription,
    List<LoyaltyTransactionResponse> transactions
) {}
