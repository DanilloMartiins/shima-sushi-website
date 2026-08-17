package br.com.seushimasushi.backend.loyalty.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "loyalty_settings")
public class LoyaltySettings {

    @Id
    private Long id = 1L;

    @Column(name = "stamps_needed", nullable = false)
    private Integer stampsNeeded = 10;

    @Column(name = "prize_description", nullable = false, length = 255)
    private String prizeDescription = "1 produto grátis do cardápio";

    @Column(name = "min_order_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean active = true;
}
