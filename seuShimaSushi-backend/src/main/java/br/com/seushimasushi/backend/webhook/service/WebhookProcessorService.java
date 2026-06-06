package br.com.seushimasushi.backend.webhook.service;

import br.com.seushimasushi.backend.webhook.model.WebhookEvent;
import br.com.seushimasushi.backend.webhook.model.WebhookEventStatus;
import br.com.seushimasushi.backend.webhook.repository.WebhookEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WebhookProcessorService {

    private static final Logger log = LoggerFactory.getLogger(WebhookProcessorService.class);

    private static final int BATCH_LIMIT = 10;
    private static final int MAX_RETRIES = 3;
    private static final int STUCK_MINUTES = 5;

    private final WebhookEventRepository webhookEventRepository;

    @Autowired
    public WebhookProcessorService(WebhookEventRepository webhookEventRepository) {
        this.webhookEventRepository = webhookEventRepository;
    }

    @Transactional
    public void processPendingEvents() {
        // Busca eventos pendentes e os que falharam mas ainda podem ser retentados
        List<String> statuses = List.of(WebhookEventStatus.PENDING.name(), WebhookEventStatus.PENDING_RETRY.name());

        List<WebhookEvent> events = webhookEventRepository
                .findPendingOrRetryWithLockAndLimit(statuses, BATCH_LIMIT);

        if (events.isEmpty()) {
            log.debug("Nenhum webhook pendente ou pra retentar");
            return;
        }

        log.info("Processando lote de {} webhook(s)...", events.size());

        for (WebhookEvent event : events) {
            processEvent(event);
        }

        webhookEventRepository.saveAll(events);
        log.info("Lote de {} webhook(s) finalizado", events.size());
    }

    @Transactional
    public void detectAndResetStuckEvents() {
        // Calcula o tempo limite: eventos PENDING mais velhos que STUCK_MINUTES
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(STUCK_MINUTES);
        List<WebhookEvent> stuckEvents = webhookEventRepository
                .findStuckEvents(WebhookEventStatus.PENDING, threshold);

        if (stuckEvents.isEmpty()) {
            log.debug("Nenhum evento travado encontrado");
            return;
        }

        log.warn("Resetando {} evento(s) travado(s) a mais de {} minuto(s)", stuckEvents.size(), STUCK_MINUTES);

        for (WebhookEvent event : stuckEvents) {
            log.warn("Evento {} travado desde {}, resetando pra PENDING_RETRY", event.getId(), event.getCreatedAt());
            event.setStatus(WebhookEventStatus.PENDING_RETRY);
        }

        webhookEventRepository.saveAll(stuckEvents);
    }

    private void processEvent(WebhookEvent event) {
        // Incrementa o contador de tentativas e registra o horário
        event.setRetryCount(event.getRetryCount() + 1);
        event.setLastAttemptAt(LocalDateTime.now());

        try {
            log.info("Processando webhook {} (eventId={}, tentativa {}/{})",
                    event.getId(), event.getEventId(), event.getRetryCount(), MAX_RETRIES);

            processPayment(event.getPayload());

            // Se chegou aqui é porque o pagamento foi processado com sucesso
            event.setStatus(WebhookEventStatus.PROCESSED);
            log.info("Webhook {} processado com sucesso", event.getId());

        } catch (Exception e) {
            log.error("Erro ao processar webhook {} (tentativa {}/{}): {}",
                    event.getId(), event.getRetryCount(), MAX_RETRIES, e.getMessage());

            // Verifica se já esgotou o número máximo de tentativas
            if (event.getRetryCount() >= MAX_RETRIES) {
                event.setStatus(WebhookEventStatus.ERROR);
                log.error("Webhook {} esgotou as {} tentativas, marcado como ERROR", event.getId(), MAX_RETRIES);
            } else {
                // Ainda tem tentativas sobrando, marca pra retentar depois
                event.setStatus(WebhookEventStatus.PENDING_RETRY);
                log.info("Webhook {} vai ser retentado mais tarde (tentativa {}/{})",
                        event.getId(), event.getRetryCount(), MAX_RETRIES);
            }
        }
    }

    private void processPayment(String payload) {
        log.debug("Simulando processamento do pagamento: {}", payload);

        // Se o payload tiver "fail", simula uma falha no processamento
        if (payload != null && payload.contains("fail")) {
            throw new RuntimeException("Falha simulada no processamento do pagamento");
        }

        // Pausa de 100ms pra simular o tempo de processamento
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Thread interrompida durante processamento", e);
        }

        log.info("Pagamento processado com sucesso");
    }
}
