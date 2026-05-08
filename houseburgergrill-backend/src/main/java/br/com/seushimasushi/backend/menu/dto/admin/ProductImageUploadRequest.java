package br.com.seushimasushi.backend.menu.dto.admin;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

public record ProductImageUploadRequest(
        @NotNull(message = "Arquivo e obrigatorio")
        MultipartFile image
) {
}
