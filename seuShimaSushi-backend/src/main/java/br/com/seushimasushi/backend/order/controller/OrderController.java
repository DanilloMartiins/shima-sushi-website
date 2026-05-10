package br.com.seushimasushi.backend.order.controller;

import br.com.seushimasushi.backend.order.dto.request.CreateOrderRequest;
import br.com.seushimasushi.backend.order.dto.response.OrderResponse;
import br.com.seushimasushi.backend.order.service.OrderService;
import br.com.seushimasushi.backend.security.model.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    // Construtor para injetar o serviço de pedidos
    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Endpoint para o cliente criar um novo pedido de sushi
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        // Pegamos o ID do usuário logado para vincular ao pedido
        OrderResponse response = orderService.createOrder(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Endpoint para o cliente listar seu próprio histórico de pedidos
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> myOrders(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<OrderResponse> response = orderService.getMyOrders(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }
}
