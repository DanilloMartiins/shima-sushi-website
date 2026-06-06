package br.com.seushimasushi.backend.webhook.scheduler;

import br.com.seushimasushi.backend.webhook.service.WebhookProcessorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class WebhookScheduler {

    private static final Logger log = LoggerFactory.getLogger(WebhookScheduler.class);

    private final WebhookProcessorService webhookProcessorService;

    @Autowired
    public WebhookScheduler(WebhookProcessorService webhookProcessorService) {
        this.webhookProcessorService = webhookProcessorService;
    }

    @Scheduled(fixedRate = 10_000)
    public void processPendingWebhooks() {
        log.debug("Verificando webhooks pendentes...");
        try {
            webhookProcessorService.processPendingEvents();
        } catch (Exception e) {
            log.error("Erro no scheduler de webhooks: {}", e.getMessage(), e);
        }
    }

    @Scheduled(fixedRate = 60_000)
    public void detectStuckWebhooks() {
        log.debug("Verificando eventos travados...");
        try {
            webhookProcessorService.detectAndResetStuckEvents();
        } catch (Exception e) {
            log.error("Erro ao detectar eventos travados: {}", e.getMessage(), e);
        }
    }
}
