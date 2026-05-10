package br.com.seushimasushi.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(
        @NotBlank(message = "Refresh token e obrigatorio")
        String refreshToken
) {
}
