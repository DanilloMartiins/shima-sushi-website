package br.com.seushimasushi.backend.inventory.repository;

import br.com.seushimasushi.backend.inventory.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
}
