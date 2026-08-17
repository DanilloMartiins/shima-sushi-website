package br.com.seushimasushi.backend.order.gateway;

import br.com.seushimasushi.backend.order.model.PaymentStatus;

/**
 * Retorno da criação de um pagamento no gateway.
 * Para PIX, o pixCopiaECola carrega o código copia-e-cola/QR.
 */
public record PaymentInitiation(
        String transactionId,
        String gatewayReference,
        String pixCopiaECola,
        PaymentStatus status
) {}