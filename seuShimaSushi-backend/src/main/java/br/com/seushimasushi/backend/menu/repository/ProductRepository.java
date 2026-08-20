package br.com.seushimasushi.backend.menu.repository;

import br.com.seushimasushi.backend.menu.model.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query(value = "SELECT p FROM Product p LEFT JOIN FETCH p.category ORDER BY p.createdAt DESC, p.id ASC",
           countQuery = "SELECT COUNT(p) FROM Product p")
    Page<Product> findAllWithCategory(Pageable pageable);

    @Query(value = "SELECT p FROM Product p LEFT JOIN FETCH p.category "
                   + "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :term, '%')) "
                   + "ORDER BY p.createdAt DESC, p.id ASC",
           countQuery = "SELECT COUNT(p) FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :term, '%'))")
    Page<Product> findAllWithCategoryByName(@Param("term") String term, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    List<Product> findByAvailableTrueAndCategoryActiveTrueOrderByCategoryNameAscNameAsc();

    long countByIsFeaturedTrue();

    @EntityGraph(attributePaths = {"category"})
    List<Product> findByIsFeaturedTrueAndAvailableTrueAndCategoryActiveTrue();
}
