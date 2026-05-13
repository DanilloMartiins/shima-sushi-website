package br.com.seushimasushi.backend.address.dto;

import java.time.Instant;

public record AddressResponse(
        Long id,
        String street,
        String number,
        String neighborhood,
        String city,
        String complement,
        String referencePoint,
        Boolean isDefault,
        Instant createdAt
) {
}
