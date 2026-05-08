package br.com.seushimasushi.backend.menu.controller;

import br.com.seushimasushi.backend.menu.dto.admin.AdminProductResponse;
import br.com.seushimasushi.backend.menu.dto.admin.ProductImageUploadResponse;
import br.com.seushimasushi.backend.menu.dto.admin.ProductUpsertRequest;
import br.com.seushimasushi.backend.menu.dto.common.PagedResponse;
import br.com.seushimasushi.backend.menu.service.AdminProductService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/products")
public class AdminProductController {

    private final AdminProductService adminProductService;

    @GetMapping
    public ResponseEntity<PagedResponse<AdminProductResponse>> list(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page nao pode ser negativa") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "Size minimo e 1")
            @Max(value = 100, message = "Size maximo e 100") int size
    ) {
        return ResponseEntity.ok(adminProductService.list(page, size));
    }

    @PostMapping
    public ResponseEntity<AdminProductResponse> create(@Valid @RequestBody ProductUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminProductService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpsertRequest request
    ) {
        return ResponseEntity.ok(adminProductService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        adminProductService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<ProductImageUploadResponse> uploadImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image
    ) {
        return ResponseEntity.ok(adminProductService.uploadImage(id, image));
    }
}
