package br.com.seushimasushi.backend.menu.dto.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CustomizationGroupRequest(
        Long id,

        @NotBlank(message = "Nome do grupo e obrigatorio")
        @Size(max = 120, message = "Nome deve ter no maximo 120 caracteres")
        String name,

        @NotNull(message = "Minimo de selecoes e obrigatorio")
        Integer minSelected,

        @NotNull(message = "Maximo de selecoes e obrigatorio")
        Integer maxSelected,

        int displayOrder,

        @Valid
        List<CustomizationOptionRequest> options
) {}
