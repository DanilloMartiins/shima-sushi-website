package br.com.seushimasushi.backend.user.controller;

import br.com.seushimasushi.backend.user.dto.UserResponse;
import br.com.seushimasushi.backend.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    /*
     * Retorna o role do usuario logado (ADMIN ou SUPER_ADMIN)
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> minhaRole(@AuthenticationPrincipal Jwt jwt) {
        String clerkId = jwt.getSubject();
        String role = userService.buscarRolePorClerkId(clerkId).orElse("CUSTOMER");

        List<String> authorities = jwt.getClaimAsStringList("authorities");
        if (authorities == null) {
            authorities = List.of();
        }

        return ResponseEntity.ok(Map.of(
                "clerkId", clerkId,
                "role", role,
                "authorities", authorities
        ));
    }

    /*
     * Lista todos os usuarios cadastrados (sem dados sensiveis)
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> listar() {
        return ResponseEntity.ok(userService.listar());
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

        try {
            String mensagem = userService.promover(clerkId);
            return ResponseEntity.ok(Map.of("mensagem", mensagem));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
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

        try {
            String mensagem = userService.rebaixar(clerkId);
            return ResponseEntity.ok(Map.of("mensagem", mensagem));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }
}
