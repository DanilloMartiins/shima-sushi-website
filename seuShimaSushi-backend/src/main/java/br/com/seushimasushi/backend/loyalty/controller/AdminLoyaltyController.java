package br.com.seushimasushi.backend.loyalty.controller;

import br.com.seushimasushi.backend.loyalty.dto.request.LoyaltySettingsRequest;
import br.com.seushimasushi.backend.loyalty.dto.response.LoyaltyCardResponse;
import br.com.seushimasushi.backend.loyalty.dto.response.LoyaltySettingsResponse;
import br.com.seushimasushi.backend.loyalty.service.LoyaltyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/loyalty")
public class AdminLoyaltyController {

    private final LoyaltyService loyaltyService;

    public AdminLoyaltyController(LoyaltyService loyaltyService) {
        this.loyaltyService = loyaltyService;
    }

    @GetMapping("/settings")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<LoyaltySettingsResponse> getSettings() {
        return ResponseEntity.ok(loyaltyService.getSettings());
    }

    @PutMapping("/settings")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<LoyaltySettingsResponse> updateSettings(@RequestBody LoyaltySettingsRequest request) {
        return ResponseEntity.ok(loyaltyService.updateSettings(request));
    }

    @GetMapping("/card/{clerkId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<?> getCard(@PathVariable String clerkId) {
        LoyaltyCardResponse card = loyaltyService.getCardByCustomerClerkId(clerkId);
        if (card == null) {
            return ResponseEntity.ok(Map.of("card", (Object) null));
        }
        return ResponseEntity.ok(Map.of("card", card));
    }

    @PutMapping("/card/{clerkId}/create")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> criarCartao(@PathVariable String clerkId) {
        loyaltyService.criarCartaoSeNecessario(clerkId);
        return ResponseEntity.ok(Map.of("mensagem", "Cartão criado com sucesso"));
    }
}
