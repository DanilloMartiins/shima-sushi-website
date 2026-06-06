package br.com.seushimasushi.backend.webhook.model;

public enum WebhookEventStatus {
    PENDING,
    PROCESSED,
    ERROR,
    PENDING_RETRY
}
