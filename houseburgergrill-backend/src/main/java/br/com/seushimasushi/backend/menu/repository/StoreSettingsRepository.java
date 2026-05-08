package br.com.seushimasushi.backend.menu.repository;

import br.com.seushimasushi.backend.menu.model.StoreSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreSettingsRepository extends JpaRepository<StoreSettings, Integer> {
}
