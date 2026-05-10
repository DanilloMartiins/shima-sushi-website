package br.com.seushimasushi.backend.scraper.scheduler;

import br.com.seushimasushi.backend.scraper.service.ProdutoScrapedService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CardapioScheduler {

    private final ProdutoScrapedService produtoService;

    @Autowired
    public CardapioScheduler(ProdutoScrapedService produtoService) {
        this.produtoService = produtoService;
    }

    // Roda logo que o sistema termina de subir
    @EventListener(ApplicationReadyEvent.class)
    public void cargaInicial() {
        log.info("Executando carga inicial do cardápio via scraping...");
        produtoService.atualizarProdutos();
    }

    // Roda a cada 30 minutos (usando CRON)
    @Scheduled(cron = "0 0/30 * * * *")
    public void executarAtualizacaoDeCardapio() {
        log.info("Iniciando tarefa agendada de atualização do cardápio externo...");
        produtoService.atualizarProdutos();
        log.info("Tarefa agendada finalizada.");
    }
}
