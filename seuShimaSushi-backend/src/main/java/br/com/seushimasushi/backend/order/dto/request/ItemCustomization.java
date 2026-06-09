package br.com.seushimasushi.backend.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ItemCustomization(
        @NotNull(message = "ID do grupo e obrigatorio")
        Long groupId,

        @NotBlank(message = "Nome do grupo e obrigatorio")
        String groupName,

        @NotNull(message = "ID da opcao e obrigatorio")
        Long optionId,

        @NotBlank(message = "Nome da opcao e obrigatorio")
        String optionName,

        @NotNull(message = "Preco adicional e obrigatorio")
        BigDecimal priceAddition
) {}
