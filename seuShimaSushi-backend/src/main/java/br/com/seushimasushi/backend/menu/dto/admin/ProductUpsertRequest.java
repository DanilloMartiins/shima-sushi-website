package br.com.seushimasushi.backend.menu.dto.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record ProductUpsertRequest(
        @NotBlank(message = "Nome e obrigatorio")
        @Size(max = 120, message = "Nome deve ter no maximo 120 caracteres")
        String name,

        @NotBlank(message = "Descricao e obrigatoria")
        @Size(max = 500, message = "Descricao deve ter no maximo 500 caracteres")
        String description,

        @NotNull(message = "Preco e obrigatorio")
        @DecimalMin(value = "0.00", message = "Preco nao pode ser negativo")
        BigDecimal price,

        @NotBlank(message = "URL da imagem e obrigatoria")
        @Size(max = 400, message = "URL da imagem deve ter no maximo 400 caracteres")
        String imageUrl,

        @NotNull(message = "Disponibilidade e obrigatoria")
        Boolean available,

        @NotNull(message = "Categoria e obrigatoria")
        Long categoryId,

        @NotNull(message = "Indicador de customizavel e obrigatorio")
        Boolean isCustomizable,

        @Valid
        List<CustomizationGroupRequest> customizationGroups
) {
}
