package br.com.seushimasushi.backend.menu.controller;

import br.com.seushimasushi.backend.menu.dto.publicview.FeaturedProductResponse;
import br.com.seushimasushi.backend.menu.dto.publicview.PublicMenuCategoryResponse;
import br.com.seushimasushi.backend.menu.dto.store.StoreSettingsResponse;
import br.com.seushimasushi.backend.menu.service.AdminProductService;
import br.com.seushimasushi.backend.menu.service.PublicMenuService;
import br.com.seushimasushi.backend.menu.service.StoreSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public")
public class PublicMenuController {

    private final PublicMenuService publicMenuService;
    private final StoreSettingsService storeSettingsService;
    private final AdminProductService adminProductService;

    // Construtor para o Spring injetar os serviços
    @Autowired
    public PublicMenuController(PublicMenuService publicMenuService, StoreSettingsService storeSettingsService, AdminProductService adminProductService) {
        this.publicMenuService = publicMenuService;
        this.storeSettingsService = storeSettingsService;
        this.adminProductService = adminProductService;
    }

    // Busca o cardápio completo organizado por categorias (público)
    @GetMapping("/menu")
    public ResponseEntity<List<PublicMenuCategoryResponse>> getMenu() {
        List<PublicMenuCategoryResponse> response = publicMenuService.getPublicMenu();
        return ResponseEntity.ok(response);
    }

    // Busca os produtos em destaque ("Os Mais Pedidos"), maximo 3
    @GetMapping("/featured-products")
    public ResponseEntity<List<FeaturedProductResponse>> getFeaturedProducts() {
        List<FeaturedProductResponse> response = adminProductService.getFeaturedProducts();
        return ResponseEntity.ok(response);
    }

    // Busca as configurações da loja, como nome e se está aberta
    @GetMapping("/store-settings")
    public ResponseEntity<StoreSettingsResponse> getStoreSettings() {
        StoreSettingsResponse response = storeSettingsService.getPublic();
        return ResponseEntity.ok(response);
    }
}
