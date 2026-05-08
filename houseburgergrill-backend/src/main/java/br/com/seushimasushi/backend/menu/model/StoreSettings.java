package br.com.seushimasushi.backend.menu.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "store_settings")
public class StoreSettings {

    @Id
    private Integer id;

    @Column(name = "store_open", nullable = false)
    private Boolean storeOpen;

    @Column(name = "opening_message", nullable = false, length = 255)
    private String openingMessage;

    @Column(name = "closing_message", nullable = false, length = 255)
    private String closingMessage;

    @Column(name = "whatsapp_number", nullable = false, length = 30)
    private String whatsappNumber;

    @Column(name = "delivery_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal deliveryFee;

    @Column(name = "minimum_order_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal minimumOrderValue;
}
