package br.com.seushimasushi.backend.webhook.controller;

import br.com.seushimasushi.backend.webhook.dto.WebhookRequest;
import br.com.seushimasushi.backend.webhook.model.WebhookEvent;
import br.com.seushimasushi.backend.webhook.model.WebhookEventStatus;
import br.com.seushimasushi.backend.webhook.repository.WebhookEventRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/webhook")
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final WebhookEventRepository webhookEventRepository;

    @Autowired
    public WebhookController(WebhookEventRepository webhookEventRepository) {
        this.webhookEventRepository = webhookEventRepository;
    }

    @PostMapping
    public ResponseEntity<Void> receiveWebhook(@Valid @RequestBody WebhookRequest request) {
        log.info("Webhook recebido: eventId={}, payload length={}", request.eventId(),
                request.payload() != null ? request.payload().length() : 0);

        // Verifica se ja processamos esse eventId antes (idempotencia)
        Optional<WebhookEvent> existing = webhookEventRepository.findByEventId(request.eventId());
        if (existing.isPresent()) {
            log.info("Webhook com eventId={} ja foi processado antes, ignorando duplicata", request.eventId());
            return ResponseEntity.ok().build();
        }

        // Salva como PENDING pra fila processar depois
        WebhookEvent event = new WebhookEvent(request.eventId(), request.payload());
        webhookEventRepository.save(event);

        log.info("Webhook salvo: id={}, eventId={}", event.getId(), event.getEventId());
        return ResponseEntity.ok().build();
    }
}
