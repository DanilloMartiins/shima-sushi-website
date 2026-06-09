package br.com.seushimasushi.backend.inventory.repository;

import br.com.seushimasushi.backend.inventory.model.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    List<InventoryTransaction> findByItemIdOrderByCreatedAtDesc(Long itemId);
}
