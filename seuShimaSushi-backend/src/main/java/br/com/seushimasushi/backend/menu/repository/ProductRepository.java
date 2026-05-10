package br.com.seushimasushi.backend.menu.repository;

import br.com.seushimasushi.backend.menu.model.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Override
    @EntityGraph(attributePaths = {"category"})
    Page<Product> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    List<Product> findByAvailableTrueAndCategoryActiveTrueOrderByCategoryNameAscNameAsc();
}
