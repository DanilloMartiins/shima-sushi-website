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
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderResponse createOrder(Long customerId, CreateOrderRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));

        validateOrderItems(request.items());
        validateDeliveryAddressRule(request.deliveryType(), request.deliveryAddress());

        Order order = Order.builder()
                .customer(customer)
                .status(OrderStatus.CREATED)
                .paymentMethod(request.paymentMethod())
                .deliveryType(request.deliveryType())
                .deliveryAddress(normalizeNullable(request.deliveryAddress()))
                .notes(normalizeNullable(request.notes()))
                .totalAmount(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;
        Set<Long> productIdsInOrder = new HashSet<>();
        for (CreateOrderItemRequest itemRequest : request.items()) {
            validateItem(itemRequest);

            if (!productIdsInOrder.add(itemRequest.productId())) {
                throw new BadRequestException("Pedido nao pode ter item duplicado para o mesmo produto");
            }

            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new NotFoundException("Produto " + itemRequest.productId() + " nao encontrado"));

            if (!Boolean.TRUE.equals(product.getAvailable())) {
                throw new BadRequestException("Produto " + product.getName() + " esta indisponivel");
            }

            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.quantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            order.getItems().add(orderItem);
            total = total.add(subtotal);
        }

        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);
        return toResponse(savedOrder, true);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(Long customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(order -> toResponse(order, true))
                .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getAdminOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> orderPage = orderRepository.findAll(pageable).map(order -> toResponse(order, true));
        return PagedResponse.from(orderPage);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Pedido nao encontrado"));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus nextStatus = request.status();

        if (!isValidTransition(currentStatus, nextStatus)) {
            throw new BadRequestException(
                    "Transicao de status invalida: " + currentStatus + " -> " + nextStatus
            );
        }

        order.setStatus(nextStatus);
        Order updatedOrder = orderRepository.save(order);
        return toResponse(updatedOrder, true);
    }

    private void validateDeliveryAddressRule(DeliveryType deliveryType, String deliveryAddress) {
        if (deliveryType == DeliveryType.ENTREGA && isBlank(deliveryAddress)) {
            throw new BadRequestException("Endereco e obrigatorio para entrega");
        }
    }

    private void validateOrderItems(List<CreateOrderItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new BadRequestException("Pedido deve ter ao menos 1 item");
        }
    }

    private void validateItem(CreateOrderItemRequest itemRequest) {
        if (itemRequest == null || itemRequest.productId() == null) {
            throw new BadRequestException("Produto e obrigatorio");
        }
        if (itemRequest.quantity() == null || itemRequest.quantity() < 1) {
            throw new BadRequestException("Quantidade deve ser maior que zero");
        }
    }

    private boolean isValidTransition(OrderStatus currentStatus, OrderStatus nextStatus) {
        if (currentStatus == nextStatus) {
            return true;
        }
        if (currentStatus == OrderStatus.CREATED) {
            return nextStatus == OrderStatus.CONFIRMED || nextStatus == OrderStatus.CANCELLED;
        }
        if (currentStatus == OrderStatus.CONFIRMED) {
            return nextStatus == OrderStatus.COMPLETED || nextStatus == OrderStatus.CANCELLED;
        }
        return false;
    }

    private OrderResponse toResponse(Order order, boolean includeItems) {
        CustomerSummaryResponse customer = new CustomerSummaryResponse(
                order.getCustomer().getId(),
                order.getCustomer().getFullName(),
                order.getCustomer().getEmail()
        );

        List<OrderItemResponse> items = includeItems
                ? order.getItems().stream()
                    .map(item -> new OrderItemResponse(
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            item.getQuantity(),
                            item.getUnitPrice(),
                            item.getSubtotal()
                    ))
                    .toList()
                : new ArrayList<>();

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
                items
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
