package br.com.seushimasushi.backend.loyalty.repository;

import br.com.seushimasushi.backend.loyalty.model.LoyaltySettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoyaltySettingsRepository extends JpaRepository<LoyaltySettings, Long> {
}
