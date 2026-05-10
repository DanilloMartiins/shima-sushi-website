package br.com.seushimasushi.backend.security.service;

import br.com.seushimasushi.backend.config.properties.AppProperties;
import br.com.seushimasushi.backend.user.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private final AppProperties appProperties;
    private final SecretKey signingKey;

    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;
        this.signingKey = Keys.hmacShaKeyFor(
                appProperties.getSecurity().getJwt().getSecret().getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateAccessToken(User user) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(appProperties.getSecurity().getJwt().getAccessTokenExpiration());

        return Jwts.builder()
                .subject(user.getEmail())
                .claims(Map.of(
                        "uid", user.getId(),
                        "role", user.getRole().name()
                ))
                .id(UUID.randomUUID().toString())
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            return username.equalsIgnoreCase(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            return parseClaims(token).getExpiration().before(new Date());
        } catch (ExpiredJwtException ex) {
            return true;
        }
    }

    public long accessTokenExpiresInSeconds() {
        return appProperties.getSecurity().getJwt().getAccessTokenExpiration().toSeconds();
    }

    public boolean isMalformed(String token) {
        try {
            parseClaims(token);
            return false;
        } catch (JwtException | IllegalArgumentException ex) {
            return true;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
