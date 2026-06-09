package br.com.seushimasushi.backend.menu.dto.publicview;

import java.util.List;

public record PublicCustomizationGroupResponse(
        Long id,
        String name,
        int minSelected,
        int maxSelected,
        int displayOrder,
        List<PublicCustomizationOptionResponse> options
) {}
