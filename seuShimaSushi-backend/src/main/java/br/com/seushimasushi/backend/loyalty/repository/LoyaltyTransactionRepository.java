package br.com.seushimasushi.backend.loyalty.repository;

import br.com.seushimasushi.backend.loyalty.model.LoyaltyTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, Long> {
    List<LoyaltyTransaction> findByCardIdOrderByCreatedAtDesc(Long cardId);
}
