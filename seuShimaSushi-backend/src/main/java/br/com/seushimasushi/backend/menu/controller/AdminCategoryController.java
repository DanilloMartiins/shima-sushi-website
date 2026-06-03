package br.com.seushimasushi.backend.menu.controller;

import br.com.seushimasushi.backend.menu.dto.admin.CategorySummaryResponse;
import br.com.seushimasushi.backend.menu.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/categories")
public class AdminCategoryController {

    private final CategoryService categoryService;

    @Autowired
    public AdminCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategorySummaryResponse>> list() {
        List<CategorySummaryResponse> categories = categoryService.listActive()
                .stream()
                .map(cat -> new CategorySummaryResponse(cat.getId(), cat.getName()))
                .toList();
        return ResponseEntity.ok(categories);
    }
}
