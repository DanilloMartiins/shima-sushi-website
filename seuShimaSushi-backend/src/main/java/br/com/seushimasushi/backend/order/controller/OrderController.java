package br.com.seushimasushi.backend.order.controller;

import br.com.seushimasushi.backend.order.dto.request.CancelOrderRequest;
import br.com.seushimasushi.backend.order.dto.request.CreateOrderRequest;
import br.com.seushimasushi.backend.order.dto.response.OrderResponse;
import br.com.seushimasushi.backend.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Endpoint para o cliente criar um novo pedido de sushi
    @PostMapping
    public ResponseEntity<OrderResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        // No Clerk, o ID do usuário vem no campo "sub" do JWT
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String clerkUserId = jwt.getSubject();
        
        OrderResponse response = orderService.createOrder(clerkUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Endpoint para o cliente listar seu próprio histórico de pedidos
    @GetMapping("/me")
    public ResponseEntity<List<OrderResponse>> myOrders(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String clerkUserId = jwt.getSubject();
        
        List<OrderResponse> response = orderService.getMyOrders(clerkUserId);
        return ResponseEntity.ok(response);
    }

    // Endpoint para o cliente cancelar o próprio pedido
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancel(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CancelOrderRequest request
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String clerkUserId = jwt.getSubject();

        OrderResponse response = orderService.cancelMyOrder(id, clerkUserId, request.reason());
        return ResponseEntity.ok(response);
    }
}
