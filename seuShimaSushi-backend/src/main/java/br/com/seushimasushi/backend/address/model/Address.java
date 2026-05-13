package br.com.seushimasushi.backend.address.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "user_addresses")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clerk_user_id", nullable = false, length = 100)
    private String clerkUserId;

    @Column(nullable = false)
    private String street;

    @Column(nullable = false, length = 20)
    private String number;

    @Column(nullable = false, length = 100)
    private String neighborhood;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    private String complement;

    @Column(name = "reference_point")
    private String referencePoint;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Address(String clerkUserId, String street, String number, String neighborhood, 
                   String city, String zipCode, String complement, String referencePoint, Boolean isDefault) {
        this.clerkUserId = clerkUserId;
        this.street = street;
        this.number = number;
        this.neighborhood = neighborhood;
        this.city = city;
        this.zipCode = zipCode;
        this.complement = complement;
        this.referencePoint = referencePoint;
        this.isDefault = isDefault;
    }
}
