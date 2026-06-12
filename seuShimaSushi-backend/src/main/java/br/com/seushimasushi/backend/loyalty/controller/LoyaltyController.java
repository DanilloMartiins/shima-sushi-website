package br.com.seushimasushi.backend.loyalty.controller;

import br.com.seushimasushi.backend.loyalty.dto.response.LoyaltyCardResponse;
import br.com.seushimasushi.backend.loyalty.service.LoyaltyService;
import br.com.seushimasushi.backend.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/loyalty")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;
    private final UserService userService;

    public LoyaltyController(LoyaltyService loyaltyService, UserService userService) {
        this.loyaltyService = loyaltyService;
        this.userService = userService;
    }

    @GetMapping("/card")
    public ResponseEntity<?> getMyCard(@AuthenticationPrincipal Jwt jwt) {
        String clerkId = jwt.getSubject();
        LoyaltyCardResponse card = loyaltyService.getCardByCustomerClerkId(clerkId);
        if (card == null) {
            return ResponseEntity.ok(Map.of("card", (Object) null));
        }
        return ResponseEntity.ok(Map.of("card", card));
    }

    @PutMapping("/phone")
    public ResponseEntity<Map<String, String>> atualizarPhone(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, String> body) {
        String clerkId = jwt.getSubject();
        String phone = body.get("phone");
        userService.atualizarPhone(clerkId, phone);
        return ResponseEntity.ok(Map.of("mensagem", "Telefone atualizado com sucesso"));
    }
}
