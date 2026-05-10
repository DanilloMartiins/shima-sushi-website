package br.com.seushimasushi.backend.scraper.service;

import br.com.seushimasushi.backend.scraper.model.Produto;
import br.com.seushimasushi.backend.scraper.repository.ProdutoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class ProdutoScrapedService {

    private final ProdutoRepository produtoRepository;
    private final CardapioScraperService scraperService;

    @Autowired
    public ProdutoScrapedService(ProdutoRepository produtoRepository, 
                                 CardapioScraperService scraperService) {
        this.produtoRepository = produtoRepository;
        this.scraperService = scraperService;
    }

    // Método principal que o Scheduler vai chamar
    @Transactional
    public void atualizarProdutos() {
        try {
            // Tenta buscar os dados novos no site externo
            List<Produto> novosProdutos = scraperService.extrairDadosDoSite();

            // Resiliência: Só limpa o banco se a gente conseguiu pegar dados novos!
            if (novosProdutos != null && !novosProdutos.isEmpty()) {
                log.info("Limpando cache antigo e salvando {} novos itens...", novosProdutos.size());
                
                // Limpa os dados antigos (cache persistente)
                produtoRepository.deleteAll();
                
                // Salva tudo de uma vez
                produtoRepository.saveAll(novosProdutos);
                
                log.info("Cache de produtos atualizado com sucesso!");
            } else {
                log.warn("Scraper retornou lista vazia. Mantendo dados atuais para não deixar o usuário sem nada.");
            }

        } catch (Exception e) {
            // Se der erro no scraping (site caiu, timeout, etc), a gente cai aqui
            log.error("Erro ao atualizar produtos via scraping. O sistema vai manter a última versão válida. Motivo: {}", e.getMessage());
            // Nota: Não relançamos a exceção aqui pro Scheduler não travar as próximas execuções
        }
    }

    // Método que o Controller vai chamar pra listar pro Front
    @Transactional(readOnly = true)
    public List<Produto> listarProdutos() {
        // Nunca chama o scraper aqui! Sempre lê direto do nosso banco.
        return produtoRepository.findAll();
    }
}
