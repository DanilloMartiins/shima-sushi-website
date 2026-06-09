package br.com.seushimasushi.backend.menu.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CustomizationOptionRequest(
        Long id,

        @NotBlank(message = "Nome da opcao e obrigatorio")
        @Size(max = 120, message = "Nome deve ter no maximo 120 caracteres")
        String name,

        @NotNull(message = "Preco adicional e obrigatorio")
        BigDecimal priceAddition,

        int displayOrder
) {}
