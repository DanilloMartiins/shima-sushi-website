package br.com.seushimasushi.backend.auth.service;

import br.com.seushimasushi.backend.auth.model.RefreshToken;
import br.com.seushimasushi.backend.auth.repository.RefreshTokenRepository;
import br.com.seushimasushi.backend.common.exception.UnauthorizedException;
import br.com.seushimasushi.backend.config.properties.AppProperties;
import br.com.seushimasushi.backend.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final AppProperties appProperties;
    private final TokenHashService tokenHashService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public CreatedRefreshToken create(User user) {
        String rawToken = generateRawToken();
        String hashedToken = tokenHashService.hash(rawToken);
        Instant expiresAt = Instant.now().plus(appProperties.getSecurity().getJwt().getRefreshTokenExpiration());

        RefreshToken entity = RefreshToken.builder()
                .user(user)
                .tokenHash(hashedToken)
                .expiresAt(expiresAt)
                .build();

        refreshTokenRepository.save(entity);
        return new CreatedRefreshToken(rawToken, expiresAt);
    }

    @Transactional
    public RefreshToken validateActiveToken(String rawToken) {
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHashService.hash(rawToken))
                .orElseThrow(() -> new UnauthorizedException("Refresh token invalido"));

        if (token.getRevokedAt() != null) {
            throw new UnauthorizedException("Refresh token revogado");
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token expirado");
        }

        return token;
    }

    @Transactional
    public void revoke(RefreshToken token) {
        if (token.getRevokedAt() == null) {
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
        }
    }

    @Transactional
    public void revokeByRawToken(String rawToken) {
        refreshTokenRepository.findByTokenHash(tokenHashService.hash(rawToken))
                .ifPresent(this::revoke);
    }

    private String generateRawToken() {
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    public record CreatedRefreshToken(String rawToken, Instant expiresAt) {
    }
}
