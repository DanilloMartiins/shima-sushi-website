package br.com.seushimasushi.backend.menu.service;

import br.com.seushimasushi.backend.menu.dto.publicview.PublicMenuCategoryResponse;
import br.com.seushimasushi.backend.menu.dto.publicview.PublicMenuProductResponse;
import br.com.seushimasushi.backend.scraper.model.Produto;
import br.com.seushimasushi.backend.scraper.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicMenuService {

    private final ProdutoRepository produtoRepository;

    @Transactional(readOnly = true)
    public List<PublicMenuCategoryResponse> getPublicMenu() {
        // Buscamos os produtos que foram raspados do site externo
        List<Produto> produtos = produtoRepository.findAll();
        
        List<PublicMenuProductResponse> productResponses = new ArrayList<>();
        for (Produto p : produtos) {
            productResponses.add(new PublicMenuProductResponse(
                    p.getId(),
                    p.getNome(),
                    "Produto importado do cardápio oficial", // Descrição genérica já que o scraper foca em nome/preço
                    p.getPreco(),
                    p.getUrlImagem()
            ));
        }

        // Criamos uma categoria única "Cardápio Geral" para simplificar a exibição no front
        // já que o scraper atual pega a lista flat do site.
        PublicMenuCategoryResponse categoriaUnica = new PublicMenuCategoryResponse(
                1L,
                "Cardápio Yooga",
                "Produtos atualizados automaticamente do site oficial",
                productResponses
        );

        return List.of(categoriaUnica);
    }
}
