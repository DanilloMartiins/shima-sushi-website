package br.com.seushimasushi.backend.order.gateway;

import br.com.seushimasushi.backend.order.model.Order;
import br.com.seushimasushi.backend.order.model.PaymentStatus;

/**
 * Contrato de integração com gateway de pagamento.
 *
 * Enquanto o gateway real não for contratado, a única implementação é a
 * DisabledPaymentGateway (ponta de fio com isolante). Quando fechar com
 * um provedor (Mercado Pago, Stripe, etc.), é só criar uma nova
 * implementação e ligar a flag app.payment.gateway-enabled.
 */
public interface PaymentGateway {

    String name();

    PaymentInitiation initiatePayment(Order order);

    PaymentStatus verifyPayment(String gatewayReference);
}