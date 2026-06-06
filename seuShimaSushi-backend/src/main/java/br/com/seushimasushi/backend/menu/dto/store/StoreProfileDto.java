package br.com.seushimasushi.backend.menu.dto.store;

public record StoreProfileDto(
        String logoUrl,
        String coverUrl,
        String addressStreet,
        String addressNumber,
        String neighborhood,
        String city,
        String zipCode,
        String referencePoint
) {
}
