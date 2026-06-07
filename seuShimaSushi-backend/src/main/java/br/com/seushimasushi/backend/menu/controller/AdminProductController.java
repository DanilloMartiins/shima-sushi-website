package br.com.seushimasushi.backend.menu.controller;

import br.com.seushimasushi.backend.menu.dto.admin.AdminProductResponse;
import br.com.seushimasushi.backend.menu.dto.admin.ProductImageUploadResponse;
import java.util.List;
import br.com.seushimasushi.backend.menu.dto.admin.ProductUpsertRequest;
import br.com.seushimasushi.backend.menu.dto.common.PagedResponse;
import br.com.seushimasushi.backend.menu.service.AdminProductService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Validated
@RequestMapping("/api/v1/admin/products")
public class AdminProductController {

    private final AdminProductService adminProductService;

    // Construtor para o Spring injetar o serviço
    @Autowired
    public AdminProductController(AdminProductService adminProductService) {
        this.adminProductService = adminProductService;
    }

    // Endpoint para listar produtos com paginação, útil para o painel administrativo
    @GetMapping
    public ResponseEntity<PagedResponse<AdminProductResponse>> list(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page nao pode ser negativa") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "Size minimo e 1")
            @Max(value = 100, message = "Size maximo e 100") int size
    ) {
        PagedResponse<AdminProductResponse> response = adminProductService.list(page, size);
        return ResponseEntity.ok(response);
    }

    // Endpoint para criar um novo produto no cardápio
    @PostMapping
    public ResponseEntity<AdminProductResponse> create(@Valid @RequestBody ProductUpsertRequest request) {
        AdminProductResponse response = adminProductService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Endpoint para atualizar os dados de um produto existente
    @PutMapping("/{id}")
    public ResponseEntity<AdminProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpsertRequest request
    ) {
        AdminProductResponse response = adminProductService.update(id, request);
        return ResponseEntity.ok(response);
    }

    // Endpoint para remover um produto do sistema pelo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        adminProductService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoint para excluir varios produtos de uma vez
    @DeleteMapping("/batch")
    public ResponseEntity<Void> deleteBatch(@RequestBody List<Long> ids) {
        adminProductService.deleteAll(ids);
        return ResponseEntity.noContent().build();
    }

    // Alterna o destaque do produto (featured). Maximo 3 produtos em destaque.
    @PostMapping("/{id}/toggle-featured")
    public ResponseEntity<AdminProductResponse> toggleFeatured(@PathVariable Long id) {
        AdminProductResponse response = adminProductService.toggleFeatured(id);
        return ResponseEntity.ok(response);
    }

    // Endpoint especial para fazer o upload da imagem do produto
    @PostMapping("/{id}/image")
    public ResponseEntity<ProductImageUploadResponse> uploadImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image
    ) {
        ProductImageUploadResponse response = adminProductService.uploadImage(id, image);
        return ResponseEntity.ok(response);
    }
}
