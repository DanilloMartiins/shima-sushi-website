package br.com.seushimasushi.backend.menu.repository;

import br.com.seushimasushi.backend.menu.model.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query(value = "SELECT p FROM Product p LEFT JOIN FETCH p.category ORDER BY p.createdAt DESC, p.id ASC",
           countQuery = "SELECT COUNT(p) FROM Product p")
    Page<Product> findAllWithCategory(Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    List<Product> findByAvailableTrueAndCategoryActiveTrueOrderByCategoryNameAscNameAsc();
}
