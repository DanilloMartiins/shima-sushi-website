package br.com.seushimasushi.backend.inventory.controller;

import br.com.seushimasushi.backend.inventory.dto.InventoryExitRequest;
import br.com.seushimasushi.backend.inventory.dto.InventoryItemRequest;
import br.com.seushimasushi.backend.inventory.dto.InventoryItemResponse;
import br.com.seushimasushi.backend.inventory.model.InventoryTransaction;
import br.com.seushimasushi.backend.inventory.service.InventoryService;
import br.com.seushimasushi.backend.user.model.User;
import br.com.seushimasushi.backend.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/admin/inventory")
public class AdminInventoryController {

    private static final Set<String> UNIDADES_VALIDAS = Set.of(
            "un", "kg", "g", "l", "ml", "cx", "pac", "duzia"
    );

    private final InventoryService inventoryService;
    private final UserRepository userRepository;

    public AdminInventoryController(InventoryService inventoryService, UserRepository userRepository) {
        this.inventoryService = inventoryService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<InventoryItemResponse>> listar() {
        return ResponseEntity.ok(inventoryService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryItemResponse> buscar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(inventoryService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<?> cadastrar(
            @Valid @RequestBody InventoryItemRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        if (!UNIDADES_VALIDAS.contains(request.unit())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erro", "Unidade invalida. Use: un, kg, g, l, ml, cx, pac, duzia"));
        }

        String nomeCriador = buscarNomeUsuario(jwt.getSubject());
        InventoryItemResponse response = inventoryService.cadastrar(request, nomeCriador);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody InventoryItemRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        if (!UNIDADES_VALIDAS.contains(request.unit())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erro", "Unidade invalida. Use: un, kg, g, l, ml, cx, pac, duzia"));
        }

        List<String> authorities = jwt.getClaimAsStringList("authorities");
        boolean isSuperAdmin = authorities != null && authorities.contains("ROLE_SUPER_ADMIN");

        try {
            InventoryItemResponse response = inventoryService.atualizar(id, request, isSuperAdmin);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Long id) {
        try {
            inventoryService.deletar(id);
            return ResponseEntity.ok(Map.of("mensagem", "Item deletado"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    @PostMapping("/{id}/exit")
    public ResponseEntity<?> registrarSaida(
            @PathVariable Long id,
            @Valid @RequestBody InventoryExitRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        String nomeAutor = buscarNomeUsuario(jwt.getSubject());

        try {
            InventoryItemResponse response = inventoryService.registrarSaida(id, request, nomeAutor);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<InventoryTransaction>> historico(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.historico(id));
    }

    private String buscarNomeUsuario(String clerkId) {
        return userRepository.findByClerkId(clerkId)
                .map(User::getFullName)
                .orElse(clerkId);
    }
}
