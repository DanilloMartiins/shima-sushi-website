package br.com.seushimasushi.backend.scraper.service;

import br.com.seushimasushi.backend.scraper.model.Produto;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class CardapioScraperService {

    private static final String URL = "https://delivery.yooga.app/seu-shima-sushi";
    private static final int TIMEOUT_MS = 10000; // 10 segundos de limite pra não travar

    public List<Produto> extrairDadosDoSite() {
        log.info("Iniciando scraping do cardápio em: {}", URL);
        List<Produto> produtosRaspados = new ArrayList<>();

        try {
            // Conecta no site e pega o HTML
            Document doc = Jsoup.connect(URL)
                    .timeout(TIMEOUT_MS)
                    .get();

            // Pega todos os containers de produtos
            // Nota: Os seletores podem variar se o site mudar o layout
            Elements items = doc.select(".product-item, [data-testid='product-item']");

            for (Element item : items) {
                try {
                    Element nameEl = item.select(".product-name, h3, span, .title").first();
                    Element priceEl = item.select(".product-price, .price, [class*='price']").first();
                    Element imgEl = item.select("img").first();

                    if (nameEl != null && priceEl != null) {
                        String nome = nameEl.text();
                        String precoTexto = priceEl.text();
                        String urlImagem = (imgEl != null) ? imgEl.attr("src") : "";

                        if (urlImagem.startsWith("//")) {
                            urlImagem = "https:" + urlImagem;
                        }

                        BigDecimal preco = limparPreco(precoTexto);
                        produtosRaspados.add(new Produto(nome, preco, urlImagem, "Geral"));
                    }
                    
                } catch (Exception e) {
                    log.warn("Erro ao processar um item do cardápio, pulando... Erro: {}", e.getMessage());
                }
            }

            log.info("Scraping finalizado com sucesso! Itens encontrados: {}", produtosRaspados.size());

        } catch (Exception e) {
            log.error("Falha crítica ao acessar o site do cardápio: {}", e.getMessage());
            throw new RuntimeException("Não foi possível acessar o site externo agora.");
        }

        return produtosRaspados;
    }

    private BigDecimal limparPreco(String precoTexto) {
        if (precoTexto == null || precoTexto.isEmpty()) {
            return BigDecimal.ZERO;
        }
        // Remove R$, espaços e outros caracteres, mantendo apenas números e separadores decimais
        String apenasNumeros = precoTexto.replace("R$", "")
                .replace(" ", "")
                .replace(".", "")
                .replace(",", ".");
        
        try {
            return new BigDecimal(apenasNumeros);
        } catch (Exception e) {
            log.warn("Não consegui converter o preço '{}', usando 0.00", precoTexto);
            return BigDecimal.ZERO;
        }
    }
}
