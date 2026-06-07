package br.com.seushimasushi.backend.user.service;

import br.com.seushimasushi.backend.user.dto.UserResponse;
import br.com.seushimasushi.backend.user.model.User;
import br.com.seushimasushi.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listar() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<String> buscarRolePorClerkId(String clerkId) {
        return userRepository.findByClerkId(clerkId)
                .map(User::getRole);
    }

    @Transactional
    public String promover(String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));

        if ("SUPER_ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("Nao pode promover um SUPER_ADMIN");
        }

        user.setRole("ADMIN");
        userRepository.save(user);
        return "Usuario promovido a admin com sucesso";
    }

    @Transactional
    public String rebaixar(String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));

        if ("SUPER_ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("Nao pode rebaixar um SUPER_ADMIN");
        }

        user.setRole("CUSTOMER");
        userRepository.save(user);
        return "Usuario rebaixado para customer com sucesso";
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getActive(),
                user.getClerkId(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
