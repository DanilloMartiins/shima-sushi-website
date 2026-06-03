package br.com.seushimasushi.backend.menu.service;

import br.com.seushimasushi.backend.common.exception.NotFoundException;
import br.com.seushimasushi.backend.menu.model.Category;
import br.com.seushimasushi.backend.menu.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Category findByIdOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Categoria nao encontrada"));
    }

    @Transactional(readOnly = true)
    public List<Category> listActive() {
        return categoryRepository.findByActiveTrueOrderByNameAsc();
    }
}
