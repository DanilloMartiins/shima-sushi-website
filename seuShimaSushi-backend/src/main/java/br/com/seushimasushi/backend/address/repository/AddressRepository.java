package br.com.seushimasushi.backend.address.repository;

import br.com.seushimasushi.backend.address.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    
    // Busca todos os endereços de um usuário específico
    List<Address> findByClerkUserId(String clerkUserId);
    
    // Busca o endereço marcado como padrão para o usuário
    Optional<Address> findByClerkUserIdAndIsDefaultTrue(String clerkUserId);
}
