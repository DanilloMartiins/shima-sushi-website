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
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicMenuService {

    private final ProdutoRepository produtoRepository;

    @Transactional(readOnly = true)
    public List<PublicMenuCategoryResponse> getPublicMenu() {
        // Buscamos os produtos que foram raspados do site externo
        List<Produto> produtos = produtoRepository.findAll();

        // Agrupamos os produtos por categoria vinda do Yooga
        Map<String, List<Produto>> produtosPorCategoria = produtos.stream()
                .filter(p -> p.getCategoria() != null)
                .collect(Collectors.groupingBy(Produto::getCategoria));

        List<PublicMenuCategoryResponse> categorias = new ArrayList<>();
        long idCounter = 1;

        // Iteramos sobre o mapa para criar as categorias formatadas
        for (Map.Entry<String, List<Produto>> entry : produtosPorCategoria.entrySet()) {
            String nomeCategoria = entry.getKey();
            List<Produto> produtosDaCategoria = entry.getValue();

            List<PublicMenuProductResponse> productResponses = new ArrayList<>();
            for (Produto p : produtosDaCategoria) {
                productResponses.add(new PublicMenuProductResponse(
                        p.getId(),
                        p.getNome(),
                        "Item do Cardápio Yooga - " + nomeCategoria,
                        p.getPreco(),
                        p.getUrlImagem()
                ));
            }

            categorias.add(new PublicMenuCategoryResponse(
                    idCounter++,
                    nomeCategoria,
                    "Produtos da categoria " + nomeCategoria,
                    productResponses
            ));
        }

        // Se houver algum produto sem categoria, colocamos numa categoria padrão
        List<Produto> semCategoria = produtos.stream().filter(p -> p.getCategoria() == null).toList();
        if (!semCategoria.isEmpty()) {
            List<PublicMenuProductResponse> extraResponses = new ArrayList<>();
            for (Produto p : semCategoria) {
                extraResponses.add(new PublicMenuProductResponse(p.getId(), p.getNome(), "Cardápio Geral", p.getPreco(), p.getUrlImagem()));
            }
            categorias.add(new PublicMenuCategoryResponse(999L, "Geral", "Outros produtos", extraResponses));
        }

        return categorias;
    }
}
