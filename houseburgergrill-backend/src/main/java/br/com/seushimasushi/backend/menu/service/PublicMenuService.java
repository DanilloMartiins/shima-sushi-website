package br.com.seushimasushi.backend.menu.service;

import br.com.seushimasushi.backend.menu.dto.publicview.PublicMenuCategoryResponse;
import br.com.seushimasushi.backend.menu.dto.publicview.PublicMenuProductResponse;
import br.com.seushimasushi.backend.menu.model.Product;
import br.com.seushimasushi.backend.menu.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PublicMenuService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<PublicMenuCategoryResponse> getPublicMenu() {
        List<Product> products = productRepository.findByAvailableTrueAndCategoryActiveTrueOrderByCategoryNameAscNameAsc();
        Map<Long, CategoryAccumulator> grouped = new LinkedHashMap<>();

        for (Product product : products) {
            Long categoryId = product.getCategory().getId();
            CategoryAccumulator accumulator = grouped.computeIfAbsent(categoryId, ignored ->
                    new CategoryAccumulator(
                            categoryId,
                            product.getCategory().getName(),
                            product.getCategory().getDescription()
                    )
            );

            accumulator.products.add(new PublicMenuProductResponse(
                    product.getId(),
                    product.getName(),
                    product.getDescription(),
                    product.getPrice(),
                    product.getImageUrl()
            ));
        }

        List<PublicMenuCategoryResponse> menu = new ArrayList<>();
        for (CategoryAccumulator accumulator : grouped.values()) {
            menu.add(new PublicMenuCategoryResponse(
                    accumulator.id,
                    accumulator.name,
                    accumulator.description,
                    accumulator.products
            ));
        }
        return menu;
    }

    private static class CategoryAccumulator {
        private final Long id;
        private final String name;
        private final String description;
        private final List<PublicMenuProductResponse> products = new ArrayList<>();

        private CategoryAccumulator(Long id, String name, String description) {
            this.id = id;
            this.name = name;
            this.description = description;
        }
    }
}
