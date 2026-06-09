package br.com.seushimasushi.backend.order.service;

import br.com.seushimasushi.backend.common.exception.BadRequestException;
import br.com.seushimasushi.backend.common.exception.NotFoundException;
import br.com.seushimasushi.backend.menu.model.Product;
import br.com.seushimasushi.backend.menu.repository.ProductRepository;
import br.com.seushimasushi.backend.menu.dto.common.PagedResponse;
import br.com.seushimasushi.backend.order.dto.request.CreateOrderItemRequest;
import br.com.seushimasushi.backend.order.dto.request.CreateOrderRequest;
import br.com.seushimasushi.backend.order.dto.request.ItemCustomization;
import br.com.seushimasushi.backend.order.dto.request.UpdateOrderStatusRequest;
import br.com.seushimasushi.backend.order.dto.response.CustomerSummaryResponse;
import br.com.seushimasushi.backend.order.dto.response.OrderItemCustomizationResponse;
import br.com.seushimasushi.backend.order.dto.response.OrderItemResponse;
import br.com.seushimasushi.backend.order.dto.response.OrderResponse;
import br.com.seushimasushi.backend.order.model.DeliveryType;
import br.com.seushimasushi.backend.order.model.Order;
import br.com.seushimasushi.backend.order.model.OrderItem;
import br.com.seushimasushi.backend.order.model.OrderStatus;
import br.com.seushimasushi.backend.order.model.PaymentMethod;
import br.com.seushimasushi.backend.order.repository.OrderRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final br.com.seushimasushi.backend.scraper.repository.ProdutoRepository produtoRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public OrderService(OrderRepository orderRepository, 
                        ProductRepository productRepository,
                        br.com.seushimasushi.backend.scraper.repository.ProdutoRepository produtoRepository,
                        ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.produtoRepository = produtoRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public OrderResponse createOrder(String customerClerkId, CreateOrderRequest request) {
        // Agora não precisamos mais buscar o User no banco, usamos o ID que veio do Clerk
        
        validateOrderItems(request.items());
        validateDeliveryAddressRule(request.deliveryType(), request.deliveryAddress());

        // Criamos a instância do pedido com o ID do Clerk
        Order order = new Order(
                customerClerkId,
                OrderStatus.PENDING_PAYMENT,
                request.paymentMethod(),
                request.deliveryType(),
                normalizeNullable(request.deliveryAddress()),
                normalizeNullable(request.notes())
        );

        BigDecimal total = BigDecimal.ZERO;
        Set<Long> productIdsInOrder = new HashSet<>();

        for (CreateOrderItemRequest itemRequest : request.items()) {
            validateItem(itemRequest);

            if (!productIdsInOrder.add(itemRequest.productId())) {
                throw new BadRequestException("Pedido nao pode ter item duplicado para o mesmo produto");
            }

            String productName;
            BigDecimal unitPrice;
            BigDecimal customAdditions = BigDecimal.ZERO;

            var productOpt = productRepository.findById(itemRequest.productId());
            if (productOpt.isPresent()) {
                Product p = productOpt.get();
                if (!Boolean.TRUE.equals(p.getAvailable())) {
                    throw new BadRequestException("Produto " + p.getName() + " esta indisponivel");
                }
                productName = p.getName();
                unitPrice = p.getPrice();
            } else {
                var scrapedOpt = produtoRepository.findById(itemRequest.productId());
                if (scrapedOpt.isEmpty()) {
                    throw new NotFoundException("Produto " + itemRequest.productId() + " nao encontrado em nenhuma base");
                }
                var sp = scrapedOpt.get();
                productName = sp.getNome();
                unitPrice = sp.getPreco();
            }

            // Calcula o adicional das customizacoes
            String customizationsJson = null;
            if (itemRequest.customizations() != null && !itemRequest.customizations().isEmpty()) {
                for (ItemCustomization c : itemRequest.customizations()) {
                    customAdditions = customAdditions.add(c.priceAddition());
                }
                try {
                    customizationsJson = objectMapper.writeValueAsString(itemRequest.customizations());
                } catch (JsonProcessingException e) {
                    throw new RuntimeException("Erro ao serializar customizacoes", e);
                }
            }

            BigDecimal itemUnitPrice = unitPrice.add(customAdditions);
            BigDecimal subtotal = itemUnitPrice.multiply(BigDecimal.valueOf(itemRequest.quantity()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(productOpt.orElse(null));
            orderItem.setProductName(productName);
            orderItem.setScrapedProductId(productOpt.isEmpty() ? itemRequest.productId() : null);
            orderItem.setQuantity(itemRequest.quantity());
            orderItem.setUnitPrice(itemUnitPrice);
            orderItem.setSubtotal(subtotal);
            orderItem.setCustomizations(customizationsJson);

            order.getItems().add(orderItem);
            total = total.add(subtotal);
        }

        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);
        return toResponse(savedOrder, true);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String customerClerkId) {
        // Buscamos os pedidos filtrando pelo ID do Clerk
        List<Order> orders = orderRepository.findByCustomerClerkIdOrderByCreatedAtDesc(customerClerkId);

        // Mock para testes — se não tiver pedidos reais, retorna dados fictícios
        if (orders.isEmpty()) {
            return getMockOrders(customerClerkId);
        }

        List<OrderResponse> responses = new ArrayList<>();
        for (Order order : orders) {
            responses.add(toResponse(order, true));
        }
        return responses;
    }

    private List<OrderResponse> getMockOrders(String clerkId) {
        CustomerSummaryResponse customer = new CustomerSummaryResponse(clerkId);
        Instant now = Instant.now();

        return List.of(
            // 1. Pendente de pagamento
            new OrderResponse(
                1000L, OrderStatus.PENDING_PAYMENT, PaymentMethod.PIX, DeliveryType.ENTREGA,
                "Rua Sete de Setembro, 300 - Centro, Vitória - ES",
                "Pagamento via Pix pendente", BigDecimal.valueOf(85), BigDecimal.valueOf(85), 2,
                "Pedro Almeida", now.minusSeconds(120), now.minusSeconds(120), customer,
                List.of(
                    new OrderItemResponse(1L, "Combinado Especial (30 peças)", 1, BigDecimal.valueOf(65), BigDecimal.valueOf(65), List.of()),
                    new OrderItemResponse(2L, "Temaki Hot", 1, BigDecimal.valueOf(20), BigDecimal.valueOf(20), List.of())
                )
            ),
            // 2. Confirmado
            new OrderResponse(
                1001L, OrderStatus.CONFIRMED, PaymentMethod.PIX, DeliveryType.ENTREGA,
                "Rua das Palmeiras, 150 - Jardim da Penha, Vitória - ES",
                "Sem cebola", BigDecimal.valueOf(62.5), BigDecimal.valueOf(62.5), 3,
                "Cliente Teste", now.minusSeconds(36000), now.minusSeconds(35800), customer,
                List.of(
                    new OrderItemResponse(1L, "Combinado Salmão (20 peças)", 1, BigDecimal.valueOf(38), BigDecimal.valueOf(38), List.of()),
                    new OrderItemResponse(2L, "Hot Roll Filadélfia (8 peças)", 1, BigDecimal.valueOf(18), BigDecimal.valueOf(18), List.of()),
                    new OrderItemResponse(3L, "H2O Limão 500ml", 1, BigDecimal.valueOf(6.5), BigDecimal.valueOf(6.5), List.of())
                )
            ),
            // 2. Em preparação
            new OrderResponse(
                1002L, OrderStatus.PREPARING, PaymentMethod.DINHEIRO, DeliveryType.RETIRADA,
                null, null, BigDecimal.valueOf(45), BigDecimal.valueOf(45), 3,
                "Cliente Teste", now.minusSeconds(1800), now.minusSeconds(1200), customer,
                List.of(
                    new OrderItemResponse(4L, "Temaki de Salmão Completo", 1, BigDecimal.valueOf(25), BigDecimal.valueOf(25), List.of()),
                    new OrderItemResponse(5L, "Sunomono", 1, BigDecimal.valueOf(12), BigDecimal.valueOf(12), List.of()),
                    new OrderItemResponse(6L, "Jōgo de Chá", 1, BigDecimal.valueOf(8), BigDecimal.valueOf(8), List.of())
                )
            ),
            // 3. Saiu para entrega
            new OrderResponse(
                1003L, OrderStatus.OUT_FOR_DELIVERY, PaymentMethod.CARTAO_CREDITO, DeliveryType.ENTREGA,
                "Av. Marechal Campos, 500 - Mata da Praia, Vitória - ES",
                "Tocar interfone 2x", BigDecimal.valueOf(97.5), BigDecimal.valueOf(97.5), 4,
                "Cliente Teste", now.minusSeconds(5400), now.minusSeconds(2400), customer,
                List.of(
                    new OrderItemResponse(7L, "Combinado Especial (30 peças)", 1, BigDecimal.valueOf(65), BigDecimal.valueOf(65), List.of()),
                    new OrderItemResponse(8L, "Temaki Hot", 1, BigDecimal.valueOf(28), BigDecimal.valueOf(28), List.of()),
                    new OrderItemResponse(9L, "Refrigerante lata", 2, BigDecimal.valueOf(6), BigDecimal.valueOf(12), List.of())
                )
            ),
            // 4. Cancelado
            new OrderResponse(
                1004L, OrderStatus.CANCELLED, PaymentMethod.PIX, DeliveryType.ENTREGA,
                "Rua da Praia, 88 - Praia do Canto, Vitória - ES",
                "Cliente desistiu", BigDecimal.valueOf(32), BigDecimal.valueOf(32), 1,
                "Cliente Teste", now.minusSeconds(172800), now.minusSeconds(171900), customer,
                List.of(
                    new OrderItemResponse(10L, "Uramaki Filadélfia (12 peças)", 1, BigDecimal.valueOf(32), BigDecimal.valueOf(32), List.of())
                )
            ),
            // 5. Completo
            new OrderResponse(
                1005L, OrderStatus.COMPLETED, PaymentMethod.PIX, DeliveryType.RETIRADA,
                null, "Quero wasabi extra", BigDecimal.valueOf(28), BigDecimal.valueOf(28), 3,
                "Cliente Teste", now.minusSeconds(86400), now.minusSeconds(85800), customer,
                List.of(
                    new OrderItemResponse(11L, "Temaki Skin", 1, BigDecimal.valueOf(20), BigDecimal.valueOf(20), List.of()),
                    new OrderItemResponse(12L, "Água Mineral", 1, BigDecimal.valueOf(3), BigDecimal.valueOf(3), List.of()),
                    new OrderItemResponse(13L, "Chá Gelado (Copo)", 1, BigDecimal.valueOf(5), BigDecimal.valueOf(5), List.of())
                )
            )
        );
    }

    @Transactional
    public OrderResponse cancelMyOrder(Long orderId, String clerkUserId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado"));

        if (!order.getCustomerClerkId().equals(clerkUserId)) {
            throw new BadRequestException("Esse pedido não pertence ao usuário logado");
        }

        if (!order.getStatus().canTransitionTo(OrderStatus.CANCELLED)) {
            throw new BadRequestException(
                    "Não é possível cancelar um pedido com status " + order.getStatus()
            );
        }

        order.setNotes(reason);
        order.setStatus(OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);
        return toResponse(updated, true);
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
        CustomerSummaryResponse customer = new CustomerSummaryResponse(order.getCustomerClerkId());

        List<OrderItemResponse> itemResponses = new ArrayList<>();
        int totalItemsCount = 0;
        
        if (includeItems && order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                String name = item.getProductName();
                Long pId = (item.getProduct() != null) ? item.getProduct().getId() : item.getScrapedProductId();

                List<OrderItemCustomizationResponse> customizations = new ArrayList<>();
                if (item.getCustomizations() != null && !item.getCustomizations().isBlank()) {
                    try {
                        customizations = objectMapper.readValue(
                                item.getCustomizations(),
                                new TypeReference<List<OrderItemCustomizationResponse>>() {}
                        );
                    } catch (JsonProcessingException e) {
                        log.warn("Erro ao desserializar customizacoes do item {}: {}", pId, e.getMessage());
                    }
                }

                OrderItemResponse itemDto = new OrderItemResponse(
                        pId,
                        name,
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal(),
                        customizations
                );
                itemResponses.add(itemDto);
                totalItemsCount += item.getQuantity();
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
                order.getTotalAmount(),
                totalItemsCount,
                "Cliente #" + order.getCustomerClerkId().substring(Math.max(0, order.getCustomerClerkId().length() - 4)),
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
