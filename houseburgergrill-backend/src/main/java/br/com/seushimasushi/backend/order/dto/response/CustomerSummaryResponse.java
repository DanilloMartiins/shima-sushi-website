package br.com.seushimasushi.backend.order.dto.response;

public record CustomerSummaryResponse(
        Long id,
        String fullName,
        String email
) {
}
