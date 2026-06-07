package br.com.seushimasushi.backend.user.controller;

import br.com.seushimasushi.backend.user.model.User;
import br.com.seushimasushi.backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /*
     * Lista todos os usuarios cadastrados
     */
    @GetMapping
    public ResponseEntity<List<User>> listar() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    /*
     * Promove um usuario a admin pelo clerk_id
     * Ex: PUT /api/v1/admin/users/promote
     * Body: { "clerkId": "user_abc123" }
     */
    @PutMapping("/promote")
    public ResponseEntity<Map<String, Object>> promover(@RequestBody Map<String, String> body) {
        String clerkId = body.get("clerkId");
        if (clerkId == null || clerkId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "clerkId é obrigatorio"));
        }

        Optional<User> userOpt = userRepository.findByClerkId(clerkId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Usuario nao encontrado"));
        }

        User user = userOpt.get();
        user.setRole("ADMIN");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("mensagem", "Usuario promovido a admin com sucesso"));
    }
}
