package br.com.seushimasushi.backend.auth.repository;

import br.com.seushimasushi.backend.auth.model.RefreshToken;
import br.com.seushimasushi.backend.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    long deleteByExpiresAtBefore(Instant now);

    long deleteByUser(User user);
}
