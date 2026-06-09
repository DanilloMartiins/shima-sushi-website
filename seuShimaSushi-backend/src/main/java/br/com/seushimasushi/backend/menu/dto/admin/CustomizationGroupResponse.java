package br.com.seushimasushi.backend.menu.dto.admin;

import java.util.List;

public record CustomizationGroupResponse(
        Long id,
        String name,
        int minSelected,
        int maxSelected,
        int displayOrder,
        List<CustomizationOptionResponse> options
) {}
