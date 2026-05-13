package br.com.seushimasushi.backend.order.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Agora referenciamos o usuário pelo ID do Clerk (String)
    @Column(name = "customer_clerk_id", nullable = false, length = 100)
    private String customerClerkId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_type", nullable = false, length = 20)
    private DeliveryType deliveryType;

    @Column(name = "delivery_address", length = 500)
    private String deliveryAddress;

    @Column(length = 500)
    private String notes;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    // Construtor atualizado para o padrão Clerk
    public Order(String customerClerkId, OrderStatus status, PaymentMethod paymentMethod, 
                 DeliveryType deliveryType, String deliveryAddress, String notes) {
        this.customerClerkId = customerClerkId;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.deliveryType = deliveryType;
        this.deliveryAddress = deliveryAddress;
        this.notes = notes;
        this.totalAmount = BigDecimal.ZERO;
        this.items = new ArrayList<>();
    }
}
