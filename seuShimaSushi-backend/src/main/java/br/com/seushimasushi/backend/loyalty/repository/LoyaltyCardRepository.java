package br.com.seushimasushi.backend.loyalty.repository;

import br.com.seushimasushi.backend.loyalty.model.LoyaltyCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoyaltyCardRepository extends JpaRepository<LoyaltyCard, Long> {
    Optional<LoyaltyCard> findByCustomerClerkId(String customerClerkId);
}
