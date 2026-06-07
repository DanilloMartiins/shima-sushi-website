package br.com.seushimasushi.backend.user.controller;

import br.com.seushimasushi.backend.user.model.User;
import br.com.seushimasushi.backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /*
     * Retorna o role do usuario logado (ADMIN ou SUPER_ADMIN)
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> minhaRole(@AuthenticationPrincipal Jwt jwt) {
        String clerkId = jwt.getSubject();
        Optional<String> role = userRepository.findByClerkId(clerkId)
                .map(User::getRole);

        List<String> authorities = jwt.getClaimAsStringList("authorities");
        if (authorities == null) {
            authorities = List.of();
        }

        return ResponseEntity.ok(Map.of(
                "clerkId", clerkId,
                "role", role.orElse("CUSTOMER"),
                "authorities", authorities
        ));
    }

    /*
     * Lista todos os usuarios cadastrados
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> listar() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    /*
     * Promove um usuario a admin pelo clerk_id
     * Ex: PUT /api/v1/admin/users/promote
     * Body: { "clerkId": "user_abc123" }
     * So SUPER_ADMIN pode promover
     */
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    @PutMapping("/users/promote")
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
        if ("SUPER_ADMIN".equals(user.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Nao pode promover um SUPER_ADMIN"));
        }
        user.setRole("ADMIN");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("mensagem", "Usuario promovido a admin com sucesso"));
    }

    /*
     * Rebaixa um admin para customer pelo clerk_id
     * Ex: PUT /api/v1/admin/users/demote
     * Body: { "clerkId": "user_abc123" }
     * So SUPER_ADMIN pode rebaixar
     */
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    @PutMapping("/users/demote")
    public ResponseEntity<Map<String, Object>> rebaixar(@RequestBody Map<String, String> body) {
        String clerkId = body.get("clerkId");
        if (clerkId == null || clerkId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "clerkId é obrigatorio"));
        }

        Optional<User> userOpt = userRepository.findByClerkId(clerkId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Usuario nao encontrado"));
        }

        User user = userOpt.get();
        if ("SUPER_ADMIN".equals(user.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Nao pode rebaixar um SUPER_ADMIN"));
        }
        user.setRole("CUSTOMER");
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("mensagem", "Usuario rebaixado para customer com sucesso"));
    }
}
