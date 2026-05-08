package br.com.seushimasushi.backend.order.controller;

import br.com.seushimasushi.backend.menu.dto.common.PagedResponse;
import br.com.seushimasushi.backend.order.dto.request.UpdateOrderStatusRequest;
import br.com.seushimasushi.backend.order.dto.response.OrderResponse;
import br.com.seushimasushi.backend.order.service.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    // Construtor para o Spring injetar o serviço de pedidos
    @Autowired
    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Listagem de todos os pedidos para o administrador acompanhar a cozinha
    @GetMapping
    public ResponseEntity<PagedResponse<OrderResponse>> list(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page nao pode ser negativa") int page,
            @RequestParam(defaultValue = "20") @Min(value = 1, message = "Size minimo e 1")
            @Max(value = 100, message = "Size maximo e 100") int size
    ) {
        PagedResponse<OrderResponse> response = orderService.getAdminOrders(page, size);
        return ResponseEntity.ok(response);
    }

    // Altera o status do pedido (ex: de PENDENTE para EM PREPARAÇÃO)
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        OrderResponse response = orderService.updateStatus(id, request);
        return ResponseEntity.ok(response);
    }
}
