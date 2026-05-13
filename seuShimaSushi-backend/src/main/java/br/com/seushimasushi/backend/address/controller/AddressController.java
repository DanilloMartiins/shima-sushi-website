package br.com.seushimasushi.backend.address.controller;

import br.com.seushimasushi.backend.address.dto.AddressRequest;
import br.com.seushimasushi.backend.address.dto.AddressResponse;
import br.com.seushimasushi.backend.address.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/addresses")
public class AddressController {

    private final AddressService addressService;

    @Autowired
    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<List<AddressResponse>> list(Authentication authentication) {
        String clerkUserId = getClerkUserId(authentication);
        return ResponseEntity.ok(addressService.listMyAddresses(clerkUserId));
    }

    @GetMapping("/default")
    public ResponseEntity<AddressResponse> getDefault(Authentication authentication) {
        String clerkUserId = getClerkUserId(authentication);
        AddressResponse response = addressService.getDefaultAddress(clerkUserId);
        if (response == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<AddressResponse> save(
            Authentication authentication,
            @Valid @RequestBody AddressRequest request
    ) {
        String clerkUserId = getClerkUserId(authentication);
        return ResponseEntity.ok(addressService.save(clerkUserId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request
    ) {
        String clerkUserId = getClerkUserId(authentication);
        return ResponseEntity.ok(addressService.update(clerkUserId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long id) {
        String clerkUserId = getClerkUserId(authentication);
        addressService.delete(clerkUserId, id);
        return ResponseEntity.noContent().build();
    }

    private String getClerkUserId(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getSubject();
    }
}
