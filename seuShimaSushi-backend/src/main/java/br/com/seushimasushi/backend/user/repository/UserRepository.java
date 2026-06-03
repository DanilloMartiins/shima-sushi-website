package br.com.seushimasushi.backend.user.repository;

import br.com.seushimasushi.backend.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByClerkId(String clerkId);
}
