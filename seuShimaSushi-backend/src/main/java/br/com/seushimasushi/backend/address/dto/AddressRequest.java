package br.com.seushimasushi.backend.address.dto;

import jakarta.validation.constraints.NotBlank;

public record AddressRequest(
        @NotBlank(message = "Rua é obrigatória")
        String street,
        
        @NotBlank(message = "Número é obrigatório")
        String number,
        
        @NotBlank(message = "Bairro é obrigatório")
        String neighborhood,

        @NotBlank(message = "Cidade é obrigatória")
        String city,

        @NotBlank(message = "CEP é obrigatório")
        String zipCode,
        
        String complement,
        String referencePoint,
        Boolean isDefault
) {
}
