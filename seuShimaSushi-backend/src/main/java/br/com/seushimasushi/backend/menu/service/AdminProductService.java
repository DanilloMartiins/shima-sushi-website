package br.com.seushimasushi.backend.menu.service;

import br.com.seushimasushi.backend.common.exception.NotFoundException;
import br.com.seushimasushi.backend.menu.dto.admin.AdminProductResponse;
import br.com.seushimasushi.backend.menu.dto.admin.CategorySummaryResponse;
import br.com.seushimasushi.backend.menu.dto.admin.ProductImageUploadResponse;
import br.com.seushimasushi.backend.menu.dto.admin.ProductUpsertRequest;
import br.com.seushimasushi.backend.menu.dto.common.PagedResponse;
import br.com.seushimasushi.backend.menu.dto.publicview.FeaturedProductResponse;
import br.com.seushimasushi.backend.menu.model.Product;
import br.com.seushimasushi.backend.menu.repository.ProductRepository;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;
    private final ImageUploadService imageUploadService;

    // Construtor para injeção de dependências
    @Autowired
    public AdminProductService(ProductRepository productRepository, 
                               CategoryService categoryService, 
                               ImageUploadService imageUploadService) {
        this.productRepository = productRepository;
        this.categoryService = categoryService;
        this.imageUploadService = imageUploadService;
    }

    @Transactional(readOnly = true)
    public PagedResponse<AdminProductResponse> list(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AdminProductResponse> productPage = productRepository.findAllWithCategory(pageable).map(this::toAdminResponse);
        return PagedResponse.from(productPage);
    }

    @Transactional
    public AdminProductResponse create(ProductUpsertRequest request) {
        // Crio o novo produto com os dados que vieram do formulário
        Product product = new Product(
                request.name().trim(),
                request.description().trim(),
                request.price(),
                request.imageUrl().trim(),
                request.available(),
                categoryService.findByIdOrThrow(request.categoryId())
        );

        Product savedProduct = productRepository.save(product);
        return toAdminResponse(savedProduct);
    }

    @Transactional
    public AdminProductResponse update(Long id, ProductUpsertRequest request) {
        // Primeiro verificamos se o produto existe no banco
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produto nao encontrado"));

        // Atualiza os campos do produto com os novos dados
        product.setName(request.name().trim());
        product.setDescription(request.description().trim());
        product.setPrice(request.price());
        product.setImageUrl(request.imageUrl().trim());
        product.setAvailable(request.available());
        product.setCategory(categoryService.findByIdOrThrow(request.categoryId()));

        Product updatedProduct = productRepository.save(product);
        return toAdminResponse(updatedProduct);
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException("Produto nao encontrado");
        }
        productRepository.deleteById(id);
    }

    @Transactional
    public void deleteAll(List<Long> ids) {
        List<Product> produtos = productRepository.findAllById(ids);
        if (produtos.size() != ids.size()) {
            throw new NotFoundException("Um ou mais produtos nao encontrados");
        }
        productRepository.deleteAll(produtos);
    }

    @Transactional(readOnly = true)
    public List<FeaturedProductResponse> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndAvailableTrueAndCategoryActiveTrue()
                .stream()
                .map(p -> new FeaturedProductResponse(
                        p.getId(),
                        p.getName(),
                        p.getDescription(),
                        p.getPrice(),
                        p.getImageUrl()
                ))
                .toList();
    }

    @Transactional
    public AdminProductResponse toggleFeatured(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Produto nao encontrado"));

        Boolean novoStatus = !product.getIsFeatured();

        // Se for marcar como destaque, verifica se ja nao tem 3 destacados
        if (novoStatus) {
            long featuredCount = productRepository.countByIsFeaturedTrue();
            if (featuredCount >= 3) {
                throw new IllegalStateException("Limite maximo de 3 produtos em destaque atingido");
            }
        }

        product.setIsFeatured(novoStatus);
        Product saved = productRepository.save(product);
        return toAdminResponse(saved);
    }

    @Transactional
    public ProductImageUploadResponse uploadImage(Long productId, MultipartFile file) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Produto nao encontrado"));

        String filename = imageUploadService.uploadProductImage(file, productId);
        String imageUrl = String.format("/images/products/%s", filename);

        product.setImageUrl(imageUrl);
        productRepository.save(product);

        log.info("Imagem de produto atualizada com sucesso. ProductId: {}, ImageUrl: {}", productId, imageUrl);

        return new ProductImageUploadResponse(
                product.getId(),
                imageUrl,
                "Imagem enviada com sucesso"
        );
    }

    private AdminProductResponse toAdminResponse(Product product) {
        return new AdminProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl(),
                product.getAvailable(),
                product.getIsFeatured(),
                new CategorySummaryResponse(product.getCategory().getId(), product.getCategory().getName()),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
