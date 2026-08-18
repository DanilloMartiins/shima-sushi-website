package br.com.seushimasushi.backend.menu.service;

import br.com.seushimasushi.backend.menu.dto.publicview.PublicCustomizationGroupResponse;
import br.com.seushimasushi.backend.menu.dto.publicview.PublicCustomizationOptionResponse;
import br.com.seushimasushi.backend.menu.dto.publicview.PublicMenuCategoryResponse;
import br.com.seushimasushi.backend.menu.dto.publicview.PublicMenuProductResponse;
import br.com.seushimasushi.backend.menu.model.CustomizationGroup;
import br.com.seushimasushi.backend.menu.model.CustomizationOption;
import br.com.seushimasushi.backend.menu.model.Product;
import br.com.seushimasushi.backend.menu.repository.ProductRepository;
import br.com.seushimasushi.backend.scraper.model.Produto;
import br.com.seushimasushi.backend.scraper.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PublicMenuService {

    private final ProdutoRepository produtoRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<PublicMenuCategoryResponse> getPublicMenu() {
        // Junta as duas fontes (scraper + admin) numa lista só, normalizando o nome
        // da categoria pra nao duplicar secao (ex: "Bebidas" do scraper e do admin)
        Map<String, List<PublicMenuProductResponse>> porCategoria = new LinkedHashMap<>();

        // 1. Produtos vindos do site externo (seed), sem customizacao
        for (Produto p : produtoRepository.findAll()) {
            String categoria = normalizarCategoria(p.getCategoria());
            String descricao = gerarDescricao(p.getNome(), p.getCategoria());
            PublicMenuProductResponse resp = new PublicMenuProductResponse(
                    p.getId(), p.getNome(), descricao, p.getPreco(), p.getUrlImagem(),
                    false, List.of(), null
            );
            porCategoria.computeIfAbsent(categoria, k -> new ArrayList<>()).add(resp);
        }

        // 2. Produtos cadastrados no admin (suportam customizacao e badge)
        for (Product p : productRepository.findByAvailableTrueAndCategoryActiveTrueOrderByCategoryNameAscNameAsc()) {
            String categoria = normalizarCategoria(p.getCategory().getName());
            PublicMenuProductResponse resp = new PublicMenuProductResponse(
                    p.getId(), p.getName(), p.getDescription(), p.getPrice(),
                    p.getImageUrl(), p.getIsCustomizable(), montarGroups(p), p.getTag()
            );
            porCategoria.computeIfAbsent(categoria, k -> new ArrayList<>()).add(resp);
        }

        // 3. Monta as categorias ordenadas pela ordem canonica (desconhecidas vao pro fim)
        List<PublicMenuCategoryResponse> categorias = new ArrayList<>();
        List<Map.Entry<String, List<PublicMenuProductResponse>>> ordenadas = new ArrayList<>(porCategoria.entrySet());
        ordenadas.sort(Comparator.comparingInt(e -> ORDEM_CANONICAS.getOrDefault(e.getKey(), 999)));
        long idCounter = 1;
        for (Map.Entry<String, List<PublicMenuProductResponse>> e : ordenadas) {
            categorias.add(new PublicMenuCategoryResponse(
                    idCounter++,
                    e.getKey(),
                    DESCRICOES.getOrDefault(e.getKey(), "Produtos da categoria " + e.getKey()),
                    e.getValue()
            ));
        }
        return categorias;
    }

    // Alias normalizados (sem acento) apontando pro nome canonico da categoria
    private static final Map<String, String> ALIAS_CATEGORIAS = Map.ofEntries(
            Map.entry("experiencia do chef", "Experiência do Chef"),
            Map.entry("entradas", "Entradas & Ceviche"),
            Map.entry("ceviche", "Entradas & Ceviche"),
            Map.entry("acompanhamentos", "Entradas & Ceviche"),
            Map.entry("poke", "Monte seu Poke"),
            Map.entry("pokes", "Monte seu Poke"),
            Map.entry("seja o chef", "Monte seu Poke"),
            Map.entry("sashimi", "Sashimi & Carpaccio"),
            Map.entry("carpaccio", "Sashimi & Carpaccio"),
            Map.entry("sushi", "Sushis Tradicionais"),
            Map.entry("sushis", "Sushis Tradicionais"),
            Map.entry("gunka 6 pecas", "Sushis Tradicionais"),
            Map.entry("uramaki 8 pecas", "Sushis Tradicionais"),
            Map.entry("makimono 8 pecas", "Sushis Tradicionais"),
            Map.entry("especiais", "Sushis Tradicionais"),
            Map.entry("hot 10 pecas", "Hots"),
            Map.entry("hot", "Hots"),
            Map.entry("hots", "Hots"),
            Map.entry("temaki", "Hots"),
            Map.entry("temakis", "Hots"),
            Map.entry("combinado", "Combinados"),
            Map.entry("combinados", "Combinados"),
            Map.entry("combinados individuais", "Combinados"),
            Map.entry("pratos quentes", "Pratos Quentes & Yakisobas"),
            Map.entry("yakisobas", "Pratos Quentes & Yakisobas"),
            Map.entry("yakisobas individuais", "Pratos Quentes & Yakisobas"),
            Map.entry("bebidas", "Bebidas"),
            Map.entry("sobremesa", "Sobremesas"),
            Map.entry("sobremesas", "Sobremesas"),
            Map.entry("complementos", "Complementos")
    );

    private static final Map<String, Integer> ORDEM_CANONICAS = Map.ofEntries(
            Map.entry("Experiência do Chef", 1),
            Map.entry("Entradas & Ceviche", 2),
            Map.entry("Monte seu Poke", 3),
            Map.entry("Sashimi & Carpaccio", 4),
            Map.entry("Sushis Tradicionais", 5),
            Map.entry("Hots", 6),
            Map.entry("Combinados", 7),
            Map.entry("Pratos Quentes & Yakisobas", 8),
            Map.entry("Bebidas", 9),
            Map.entry("Sobremesas", 10),
            Map.entry("Complementos", 11)
    );

    private static final Map<String, String> DESCRICOES = Map.ofEntries(
            Map.entry("Experiência do Chef", "Experiencias especiais preparadas pelo chef"),
            Map.entry("Entradas & Ceviche", "Entradas, ceviches e acompanhamentos"),
            Map.entry("Monte seu Poke", "Monte seu poke ou combinacao personalizada"),
            Map.entry("Sashimi & Carpaccio", "Sashimis e carpaccios frescos"),
            Map.entry("Sushis Tradicionais", "Sushis, gunkas, uramakis e makimonos"),
            Map.entry("Hots", "Hot rolls e temakis empanados"),
            Map.entry("Combinados", "Combinados para compartilhar"),
            Map.entry("Pratos Quentes & Yakisobas", "Pratos quentes e yakisobas"),
            Map.entry("Bebidas", "Bebidas para acompanhar seu pedido"),
            Map.entry("Sobremesas", "Sobremesas orientais"),
            Map.entry("Complementos", "Complementos e adicionais")
    );

    // Nome de categoria vem do seed ou do admin, entao a gente padroniza
    private String normalizarCategoria(String categoria) {
        if (categoria == null || categoria.isBlank()) {
            return "Outros";
        }
        String chave = normalizarTexto(categoria);
        String canonica = ALIAS_CATEGORIAS.get(chave);
        if (canonica != null) {
            return canonica;
        }
        // Categoria criada direto no admin e que nao tem alias: mantem o nome original
        return categoria.trim();
    }

    // Remove acentos e caracteres especiais pra bater com as chaves do mapa
    private String normalizarTexto(String texto) {
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^a-z0-9 ]", " ")
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", " ");
    }

    private List<PublicCustomizationGroupResponse> montarGroups(Product p) {
        List<PublicCustomizationGroupResponse> groups = new ArrayList<>();
        if (Boolean.TRUE.equals(p.getIsCustomizable()) && p.getCustomizationGroups() != null) {
            for (CustomizationGroup g : p.getCustomizationGroups()) {
                List<PublicCustomizationOptionResponse> opts = new ArrayList<>();
                if (g.getOptions() != null) {
                    for (CustomizationOption o : g.getOptions()) {
                        opts.add(new PublicCustomizationOptionResponse(
                                o.getId(), o.getName(), o.getPriceAddition(), o.getDisplayOrder()
                        ));
                    }
                }
                groups.add(new PublicCustomizationGroupResponse(
                        g.getId(), g.getName(), g.getMinSelected(), g.getMaxSelected(),
                        g.getDisplayOrder(), opts
                ));
            }
        }
        return groups;
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
