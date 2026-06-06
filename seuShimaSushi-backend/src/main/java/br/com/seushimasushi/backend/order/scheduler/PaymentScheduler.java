package br.com.seushimasushi.backend.order.scheduler;

import br.com.seushimasushi.backend.order.model.Order;
import br.com.seushimasushi.backend.order.model.OrderStatus;
import br.com.seushimasushi.backend.order.repository.OrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
public class PaymentScheduler {

    private final OrderRepository orderRepository;

    @Autowired
    public PaymentScheduler(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Verifica a cada 1 minuto pedidos com status PENDING_PAYMENT
     * que estão há mais de 10 minutos sem confirmação.
     *
     * Quando o gateway de pagamento real for integrado, esse scheduler
     * deve consultar o gateway para ver o status real do pagamento.
     */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void verificarPagamentosPendentes() {
        Instant limite = Instant.now().minusSeconds(600); // 10 minutos atrás

        List<Order> pendentes = orderRepository
                .findByStatusAndCreatedAtBefore(OrderStatus.PENDING_PAYMENT, limite);

        for (Order order : pendentes) {
            // Mock: simulando consulta ao gateway de pagamento
            // Quando tiver gateway real, aqui faria a chamada HTTP
            boolean pagamentoConfirmado = simularConfirmacaoGateway(order);

            if (pagamentoConfirmado) {
                order.setStatus(OrderStatus.CONFIRMED);
                log.info("Pagamento confirmado para pedido #{}", order.getId());
            } else {
                order.setStatus(OrderStatus.CANCELLED);
                order.setNotes("Tempo de pagamento expirado - nenhuma confirmação em 10 minutos");
                log.warn("Pedido #{} cancelado por tempo de pagamento expirado", order.getId());
            }

            orderRepository.save(order);
        }
    }

    /**
     * Mock de consulta ao gateway — retorna false (cancelado) para simular
     * o comportamento real de timeout.
     *
     * Quando o gateway for integrado, trocar por uma chamada HTTP real.
     */
    private boolean simularConfirmacaoGateway(Order order) {
        // TODO: Integrar com gateway de pagamento real (Mercado Pago, Stripe, etc.)
        return false;
    }
}
