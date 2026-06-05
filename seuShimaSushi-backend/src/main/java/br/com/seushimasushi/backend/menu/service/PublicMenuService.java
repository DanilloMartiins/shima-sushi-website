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
                String descricao = gerarDescricao(p.getNome(), nomeCategoria);
                productResponses.add(new PublicMenuProductResponse(
                        p.getId(),
                        p.getNome(),
                        descricao,
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
                String descricao = gerarDescricao(p.getNome(), "Geral");
                extraResponses.add(new PublicMenuProductResponse(p.getId(), p.getNome(), descricao, p.getPreco(), p.getUrlImagem()));
            }
            categorias.add(new PublicMenuCategoryResponse(999L, "Geral", "Outros produtos", extraResponses));
        }

        return categorias;
    }

    /**
     * Gera uma descricao bonitinha pro produto baseada no nome.
     * Como os produtos do scraper nao tem descricao, a gente improvisa.
     */
    private String gerarDescricao(String nome, String categoria) {
        if (nome == null || nome.isBlank()) {
            return "Produto delicioso do nosso cardapio.";
        }

        String nomeLower = nome.toLowerCase();

        // Combinados
        if (nomeLower.contains("combinado")) {
            if (nomeLower.contains("salmao")) {
                return "Selecao especial de sushis e sashimis de salmao fresco.";
            }
            if (nomeLower.contains("hot")) {
                return "Combinado de sushis empanados e fritos, crocantes por fora e macios por dentro.";
            }
            return "Variados sushis e sashimis selecionados para compartilhar.";
        }

        // Hot rolls (ex: Hot Philadelphia, Hot Filadelfia, etc.)
        if (nomeLower.contains("hot") && !nomeLower.contains("combinado") && !nomeLower.contains("temaki")) {
            if (nomeLower.contains("philadelphia") || nomeLower.contains("filadelfia")) {
                return "Hot roll recheado com salmao e cream cheese, empanado e frito.";
            }
            if (nomeLower.contains("salmao")) {
                return "Hot roll de salmao, empanado e frito, com molho especial.";
            }
            return "Hot roll empanado e frito, crocante por fora e macio por dentro.";
        }

        // Temakis
        if (nomeLower.contains("temaki")) {
            if (nomeLower.contains("salmao") && !nomeLower.contains("hot") && !nomeLower.contains("skin")) {
                return "Cone de nori recheado com salmao, cream cheese e cebolinha.";
            }
            if (nomeLower.contains("hot")) {
                return "Cone de nori recheado com salmao, empanado e frito, com cream cheese e molho tare.";
            }
            if (nomeLower.contains("skin")) {
                return "Cone de nori com pele de salmao grelhada, cream cheese e molho tare.";
            }
            return "Cone de nori recheado com ingredientes selecionados.";
        }

        // Bebidas
        if (nomeLower.contains("refrigerante") || nomeLower.contains("lata")) {
            return "Bebida gelada na lata para acompanhar seu pedido.";
        }
        if (nomeLower.contains("agua") || nomeLower.contains("agua")) {
            return "Agua mineral fresquinha.";
        }
        if (nomeLower.contains("cha") || nomeLower.contains("cha")) {
            return "Cha gelado refrescante para acompanhar seu sushi.";
        }

        // Ceviche
        if (nomeLower.contains("ceviche")) {
            return "Ceviche fresquinho preparado na hora com peixe e temperos especiais.";
        }

        // Acompanhamentos
        if (nomeLower.contains("sunomono")) {
            return "Saladinha de pepino agridoce com gergelim, tradicional da culinaria japonesa.";
        }
        if (nomeLower.contains("gengibre")) {
            return "Fatias de gengibre em conserva para limpar o paladar entre as pecas.";
        }
        if (nomeLower.contains("edamame")) {
            return "Graos de soja verde cozidos e levemente salgados.";
        }

        // Fallback generico baseado na categoria
        if (categoria != null) {
            String catLower = categoria.toLowerCase();
            if (catLower.contains("bebida")) {
                return "Bebida para acompanhar seu pedido.";
            }
            if (catLower.contains("temaki")) {
                return "Temaki fresquinho preparado na hora.";
            }
            if (catLower.contains("combinado") || catLower.contains("combinado")) {
                return "Combinado de sushis e sashimis selecionados.";
            }
        }

        return "Produto fresco e saboroso do Seu Shima Sushi.";
    }
}
