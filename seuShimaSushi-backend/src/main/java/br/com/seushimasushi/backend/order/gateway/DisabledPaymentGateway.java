package br.com.seushimasushi.backend.order.gateway;

import br.com.seushimasushi.backend.order.model.Order;
import br.com.seushimasushi.backend.order.model.PaymentStatus;
import org.springframework.stereotype.Component;

/**
 * Implementação padrão enquanto nenhum gateway foi contratado.
 * Existe só pra deixar o contrato (interface) plugado no sistema;
 * se for chamada, é porque esquecemos de ligar o gateway de verdade.
 */
@Component
public class DisabledPaymentGateway implements PaymentGateway {

    @Override
    public String name() {
        return "disabled";
    }

    @Override
    public PaymentInitiation initiatePayment(Order order) {
        throw new UnsupportedOperationException(
                "Gateway de pagamento não configurado. Implemente uma integração real e ligue app.payment.gateway-enabled.");
    }

    @Override
    public PaymentStatus verifyPayment(String gatewayReference) {
        throw new UnsupportedOperationException(
                "Gateway de pagamento não configurado. Implemente uma integração real e ligue app.payment.gateway-enabled.");
    }
}