package br.com.seushimasushi.backend.order.repository;

import br.com.seushimasushi.backend.order.model.Order;
import br.com.seushimasushi.backend.order.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Override
    Page<Order> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"items", "items.product"})
    List<Order> findByCustomerClerkIdOrderByCreatedAtDesc(String customerClerkId);

    List<Order> findByStatusAndCreatedAtBefore(OrderStatus status, Instant createdAt);
}
