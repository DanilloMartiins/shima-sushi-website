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
    private final ProductRepository productRepository;
    private final br.com.seushimasushi.backend.scraper.repository.ProdutoRepository produtoRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository, 
                        ProductRepository productRepository,
                        br.com.seushimasushi.backend.scraper.repository.ProdutoRepository produtoRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.produtoRepository = produtoRepository;
    }

    @Transactional
    public OrderResponse createOrder(String customerClerkId, CreateOrderRequest request) {
        // Agora não precisamos mais buscar o User no banco, usamos o ID que veio do Clerk
        
        validateOrderItems(request.items());
        validateDeliveryAddressRule(request.deliveryType(), request.deliveryAddress());

        // Criamos a instância do pedido com o ID do Clerk
        Order order = new Order(
                customerClerkId,
                OrderStatus.CREATED,
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

            // Tentamos buscar primeiro na tabela de produtos manuais (Admin)
            // Se não achar, buscamos na tabela de produtos raspados (Yooga)
            String productName;
            BigDecimal unitPrice;

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

            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.quantity()));

            // Criamos o item. Como o OrderItem no banco aponta para 'Product' (entidade admin),
            // se o item for do scraper, vamos precisar de uma solução melhor no futuro (como unificar tabelas).
            // Por enquanto, se for do scraper, vamos apenas calcular o total sem persistir o vínculo fixo no DB
            // OU (solução rápida de dev) vamos focar em retornar o DTO correto para o WhatsApp.
            
            // Para não quebrar o JPA (que espera uma entidade Product), vamos tentar associar um 'Product' fake ou nulo
            // mas o ideal é que o scraper salve na mesma tabela. 
            // Como sou Júnior+, vou fazer o básico que funciona: persistir se tiver Product, senão só logar (por enquanto).
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(productOpt.orElse(null)); // Pode ser null se for do scraper (precisa ajustar o banco se for NOT NULL)
            orderItem.setQuantity(itemRequest.quantity());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setSubtotal(subtotal);

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
        List<OrderResponse> responses = new ArrayList<>();
        
        for (Order order : orders) {
            responses.add(toResponse(order, true));
        }
        
        return responses;
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
        // DTO de resposta agora contém apenas o ID do Clerk para o cliente
        CustomerSummaryResponse customer = new CustomerSummaryResponse(order.getCustomerClerkId());

        List<OrderItemResponse> itemResponses = new ArrayList<>();
        int totalItemsCount = 0;
        
        if (includeItems && order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                // Se o produto for null (veio do scraper), pegamos o nome de forma genérica
                String name = (item.getProduct() != null) ? item.getProduct().getName() : "Item do Cardápio Yooga";
                Long pId = (item.getProduct() != null) ? item.getProduct().getId() : 0L;

                OrderItemResponse itemDto = new OrderItemResponse(
                        pId,
                        name,
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
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
                order.getTotalAmount(), // totalPrice = totalAmount
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
