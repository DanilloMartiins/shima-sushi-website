package br.com.seushimasushi.backend.menu.dto.admin;

public record ProductImageUploadResponse(
        Long productId,
        String imageUrl,
        String message
) {
}
