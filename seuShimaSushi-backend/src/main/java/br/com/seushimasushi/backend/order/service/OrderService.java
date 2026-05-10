package br.com.seushimasushi.backend.order.service;

import br.com.seushimasushi.backend.common.exception.BadRequestException;
import br.com.seushimasushi.backend.common.exception.NotFoundException;
import br.com.seushimasushi.backend.menu.model.Product;
import br.com.seushimasushi.backend.menu.repository.ProductRepository;
import br.com.seushimasushi.backend.menu.dto.common.PagedResponse;
import br.com.seushimasushi.backend.order.dto.request.CreateOrderItemRequest;
import br.com.seushimasushi.backend.order.dto.request.CreateOrderRequest;
import br.com.seushimasushi.backend.order.dto.request.UpdateOrderStatusRequest;
import br.com.seushimasushi.backend.order.dto.response.CustomerSummaryResponse;
import br.com.seushimasushi.backend.order.dto.response.OrderItemResponse;
import br.com.seushimasushi.backend.order.dto.response.OrderResponse;
import br.com.seushimasushi.backend.order.model.DeliveryType;
import br.com.seushimasushi.backend.order.model.Order;
import br.com.seushimasushi.backend.order.model.OrderItem;
import br.com.seushimasushi.backend.order.model.OrderStatus;
import br.com.seushimasushi.backend.order.repository.OrderRepository;
import br.com.seushimasushi.backend.user.model.User;
import br.com.seushimasushi.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    // Injeção de dependência via construtor
    @Autowired
    public OrderService(OrderRepository orderRepository, 
                        UserRepository userRepository, 
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderResponse createOrder(Long customerId, CreateOrderRequest request) {
        // Pego o cliente que tá fazendo o pedido
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));

        // Dou uma conferida se os itens e o endereço estão ok antes de seguir
        validateOrderItems(request.items());
        validateDeliveryAddressRule(request.deliveryType(), request.deliveryAddress());

        // Começo a montar o objeto do pedido
        Order order = new Order(
                customer,
                OrderStatus.CREATED,
                request.paymentMethod(),
                request.deliveryType(),
                normalizeNullable(request.deliveryAddress()),
                normalizeNullable(request.notes())
        );

        BigDecimal total = BigDecimal.ZERO;
        Set<Long> productIdsInOrder = new HashSet<>();

        // Aqui eu percorro os itens que vieram no request pra criar os itens do pedido
        for (CreateOrderItemRequest itemRequest : request.items()) {
            validateItem(itemRequest);

            // Regrinha: não pode ter o mesmo produto repetido em linhas diferentes
            if (!productIdsInOrder.add(itemRequest.productId())) {
                throw new BadRequestException("Pedido nao pode ter item duplicado para o mesmo produto");
            }

            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new NotFoundException("Produto " + itemRequest.productId() + " nao encontrado"));

            // Só vendo se tiver no cardápio disponível
            if (!Boolean.TRUE.equals(product.getAvailable())) {
                throw new BadRequestException("Produto " + product.getName() + " esta indisponivel");
            }

            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.quantity()));

            // Instancio o item e ligo ele ao pedido principal
            OrderItem orderItem = new OrderItem(
                    order,
                    product,
                    itemRequest.quantity(),
                    unitPrice,
                    subtotal
            );

            order.getItems().add(orderItem);
            total = total.add(subtotal);
        }

        // Atualizo o valor final do pedido somando tudo
        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);
        return toResponse(savedOrder, true);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(Long customerId) {
        // Buscamos os pedidos e convertemos para DTO usando um loop simples
        List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        List<OrderResponse> responses = new ArrayList<>();
        
        for (Order order : orders) {
            responses.add(toResponse(order, true));
        }
        
        return responses;
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getAdminOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        // Aqui o map ainda faz sentido por ser uma Page, mas a lógica interna é clara
        Page<OrderResponse> orderPage = orderRepository.findAll(pageable).map(order -> toResponse(order, true));
        return PagedResponse.from(orderPage);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado"));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus nextStatus = request.status();

        if (!currentStatus.canTransitionTo(nextStatus)) {
            throw new BadRequestException(
                    "Transição de status inválida: " + currentStatus + " -> " + nextStatus
            );
        }

        order.setStatus(nextStatus);
        Order updatedOrder = orderRepository.save(order);
        return toResponse(updatedOrder, true);
    }

    private void validateDeliveryAddressRule(DeliveryType deliveryType, String deliveryAddress) {
        if (deliveryType == DeliveryType.ENTREGA && isBlank(deliveryAddress)) {
            throw new BadRequestException("Endereço é obrigatório para entrega");
        }
    }

    private void validateOrderItems(List<CreateOrderItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new BadRequestException("Pedido deve ter ao menos 1 item");
        }
    }

    private void validateItem(CreateOrderItemRequest itemRequest) {
        if (itemRequest == null || itemRequest.productId() == null) {
            throw new BadRequestException("Produto é obrigatório");
        }
        if (itemRequest.quantity() == null || itemRequest.quantity() < 1) {
            throw new BadRequestException("Quantidade deve ser maior que zero");
        }
    }

    private OrderResponse toResponse(Order order, boolean includeItems) {
        CustomerSummaryResponse customer = new CustomerSummaryResponse(
                order.getCustomer().getId(),
                order.getCustomer().getFullName(),
                order.getCustomer().getEmail()
        );

        List<OrderItemResponse> itemResponses = new ArrayList<>();
        
        // Se solicitado, convertemos os itens da entidade para o DTO de resposta
        if (includeItems && order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                OrderItemResponse itemDto = new OrderItemResponse(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                );
                itemResponses.add(itemDto);
            }
        }

        return new OrderResponse(
                order.getId(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getDeliveryType(),
                order.getDeliveryAddress(),
                order.getNotes(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                customer,
                itemResponses
        );
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
