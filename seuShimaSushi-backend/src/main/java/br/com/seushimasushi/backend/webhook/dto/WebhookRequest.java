package br.com.seushimasushi.backend.webhook.dto;

public record WebhookRequest(
    @jakarta.validation.constraints.NotBlank(message = "eventId é obrigatório")
    String eventId,

    @jakarta.validation.constraints.NotBlank(message = "payload é obrigatório")
    String payload
) {}
