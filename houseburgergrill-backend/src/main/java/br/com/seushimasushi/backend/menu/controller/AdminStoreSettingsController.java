package br.com.seushimasushi.backend.menu.controller;

import br.com.seushimasushi.backend.menu.dto.store.StoreSettingsResponse;
import br.com.seushimasushi.backend.menu.dto.store.UpdateStoreSettingsRequest;
import br.com.seushimasushi.backend.menu.service.StoreSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/store-settings")
public class AdminStoreSettingsController {

    private final StoreSettingsService storeSettingsService;

    @GetMapping
    public ResponseEntity<StoreSettingsResponse> get() {
        return ResponseEntity.ok(storeSettingsService.getAdmin());
    }

    @PutMapping
    public ResponseEntity<StoreSettingsResponse> update(@Valid @RequestBody UpdateStoreSettingsRequest request) {
        return ResponseEntity.ok(storeSettingsService.update(request));
    }
}
