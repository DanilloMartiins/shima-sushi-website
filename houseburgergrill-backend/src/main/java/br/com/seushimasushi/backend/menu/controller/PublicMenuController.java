package br.com.seushimasushi.backend.menu.controller;

import br.com.seushimasushi.backend.menu.dto.publicview.PublicMenuCategoryResponse;
import br.com.seushimasushi.backend.menu.dto.store.StoreSettingsResponse;
import br.com.seushimasushi.backend.menu.service.PublicMenuService;
import br.com.seushimasushi.backend.menu.service.StoreSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/public")
public class PublicMenuController {

    private final PublicMenuService publicMenuService;
    private final StoreSettingsService storeSettingsService;

    @GetMapping("/menu")
    public ResponseEntity<List<PublicMenuCategoryResponse>> getMenu() {
        return ResponseEntity.ok(publicMenuService.getPublicMenu());
    }

    @GetMapping("/store-settings")
    public ResponseEntity<StoreSettingsResponse> getStoreSettings() {
        return ResponseEntity.ok(storeSettingsService.getPublic());
    }
}
