package br.com.seushimasushi.backend.menu.controller;

import br.com.seushimasushi.backend.menu.dto.store.StoreSettingsResponse;
import br.com.seushimasushi.backend.menu.dto.store.UpdateStoreSettingsRequest;
import br.com.seushimasushi.backend.menu.service.StoreSettingsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/store-settings")
public class AdminStoreSettingsController {

    private final StoreSettingsService storeSettingsService;

    // Injeção de dependência via construtor
    @Autowired
    public AdminStoreSettingsController(StoreSettingsService storeSettingsService) {
        this.storeSettingsService = storeSettingsService;
    }

    // Busca as configurações atuais da loja para edição no painel admin
    @GetMapping
    public ResponseEntity<StoreSettingsResponse> get() {
        StoreSettingsResponse response = storeSettingsService.getAdmin();
        return ResponseEntity.ok(response);
    }

    // Salva as alterações feitas nas configurações da loja (nome, status aberto/fechado)
    @PutMapping
    public ResponseEntity<StoreSettingsResponse> update(@Valid @RequestBody UpdateStoreSettingsRequest request) {
        StoreSettingsResponse response = storeSettingsService.update(request);
        return ResponseEntity.ok(response);
    }
}
