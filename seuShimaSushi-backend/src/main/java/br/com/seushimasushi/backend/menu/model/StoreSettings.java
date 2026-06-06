package br.com.seushimasushi.backend.menu.model;

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

    @Column(name = "store_profile_logo_url", nullable = false, length = 500)
    private String storeProfileLogoUrl;

    @Column(name = "store_profile_cover_url", nullable = false, length = 500)
    private String storeProfileCoverUrl;

    @Column(name = "store_profile_address_street", nullable = false, length = 255)
    private String storeProfileAddressStreet;

    @Column(name = "store_profile_address_number", nullable = false, length = 20)
    private String storeProfileAddressNumber;

    @Column(name = "store_profile_neighborhood", nullable = false, length = 255)
    private String storeProfileNeighborhood;

    @Column(name = "store_profile_city", nullable = false, length = 255)
    private String storeProfileCity;

    @Column(name = "store_profile_zip_code", nullable = false, length = 10)
    private String storeProfileZipCode;

    @Column(name = "store_profile_reference_point", nullable = false, length = 255)
    private String storeProfileReferencePoint;

    @Column(name = "estimated_delivery_time", nullable = false, length = 255)
    private String estimatedDeliveryTime;

    @Column(name = "business_hours", nullable = false, columnDefinition = "TEXT")
    private String businessHoursJson;

    @Column(name = "payment_methods", nullable = false, columnDefinition = "TEXT")
    private String paymentMethodsJson;

    // Construtor para as configurações da loja
    public StoreSettings(Integer id, Boolean storeOpen, String openingMessage, String closingMessage,
                         String whatsappNumber, BigDecimal deliveryFee, BigDecimal minimumOrderValue) {
        this.id = id;
        this.storeOpen = storeOpen;
        this.openingMessage = openingMessage;
        this.closingMessage = closingMessage;
        this.whatsappNumber = whatsappNumber;
        this.deliveryFee = deliveryFee;
        this.minimumOrderValue = minimumOrderValue;
    }
}
