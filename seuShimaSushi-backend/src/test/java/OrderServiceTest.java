package br.com.seushimasushi.backend.order.service;

import br.com.seushimasushi.backend.common.exception.BadRequestException;
import br.com.seushimasushi.backend.common.exception.NotFoundException;
import br.com.seushimasushi.backend.auth.repository.RefreshTokenRepository;
import br.com.seushimasushi.backend.menu.model.Category;
import br.com.seushimasushi.backend.menu.model.Product;
import br.com.seushimasushi.backend.menu.repository.CategoryRepository;
import br.com.seushimasushi.backend.menu.repository.ProductRepository;
import br.com.seushimasushi.backend.order.dto.request.CreateOrderItemRequest;
import br.com.seushimasushi.backend.order.dto.request.CreateOrderRequest;
import br.com.seushimasushi.backend.order.model.DeliveryType;
import br.com.seushimasushi.backend.order.model.PaymentMethod;
import br.com.seushimasushi.backend.order.repository.OrderRepository;
import br.com.seushimasushi.backend.order.service.OrderService;
import br.com.seushimasushi.backend.user.model.Role;
import br.com.seushimasushi.backend.user.model.User;
import br.com.seushimasushi.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class OrderServiceTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    private User clienteTeste;
    private Category categoriaTeste;
    private Product produtoTeste;
    private Product produtoTeste2;

    @BeforeEach
    void setup() {
        orderRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        clienteTeste = new User("Cliente Teste", "cliente@test.com", "hashed", Role.CUSTOMER);
        clienteTeste = userRepository.save(clienteTeste);

        categoriaTeste = new Category("Combos", "Categoria de teste");
        categoriaTeste = categoryRepository.save(categoriaTeste);

        produtoTeste = new Product("Combinado Salmão", "O mais pedido da casa", BigDecimal.valueOf(25.00), "/images/combinado.png", true, categoriaTeste);
        produtoTeste = productRepository.save(produtoTeste);

        produtoTeste2 = new Product("Refrigerante", "Refrigerante gelado", BigDecimal.valueOf(8.00), "/images/refrigerante.png", true, categoriaTeste);
        produtoTeste2 = productRepository.save(produtoTeste2);
        produtoTeste2 = productRepository.save(produtoTeste2);
    }

    @Nested
    @DisplayName("Criação de Pedidos")
    class CriacaoPedidos {

        @Test
        @DisplayName("Deve criar pedido com dados válidos - retirada")
        void deveCriarPedidoRetirada() {
            var item = new CreateOrderItemRequest(produtoTeste.getId(), 2);
            var request = new CreateOrderRequest(
                    PaymentMethod.PIX,
                    DeliveryType.RETIRADA,
                    null,
                    null,
                    List.of(item)
            );

            var response = orderService.createOrder(clienteTeste.getId(), request);

            assertNotNull(response, "Resposta não deveria ser null");
            assertEquals(new BigDecimal("50.00"), response.totalAmount(), "Total deveria ser 50");
            assertEquals(1, response.items().size(), "Deveria ter 1 item");
            assertEquals(DeliveryType.RETIRADA, response.deliveryType(), "Tipo deveria ser RETIRADA");
        }

        @Test
        @DisplayName("Deve criar pedido com entrega válida")
        void deveCriarPedidoComEntrega() {
            var item = new CreateOrderItemRequest(produtoTeste.getId(), 1);
            var request = new CreateOrderRequest(
                    PaymentMethod.CARTAO_CREDITO,
                    DeliveryType.ENTREGA,
                    "Rua Principal, 123",
                    "Complemento",
                    List.of(item)
            );

            var response = orderService.createOrder(clienteTeste.getId(), request);

            assertNotNull(response, "Resposta não deveria ser null");
            assertEquals(DeliveryType.ENTREGA, response.deliveryType(), "Tipo deveria ser ENTREGA");
        }

        @Test
        @DisplayName("Deve calcular total correto com múltiplos itens")
        void deveCalcularTotalCorreto() {
            var item1 = new CreateOrderItemRequest(produtoTeste.getId(), 2);
            var item2 = new CreateOrderItemRequest(produtoTeste2.getId(), 3);
            var request = new CreateOrderRequest(
                    PaymentMethod.PIX,
                    DeliveryType.RETIRADA,
                    null,
                    null,
                    List.of(item1, item2)
            );

            var response = orderService.createOrder(clienteTeste.getId(), request);

            // 25 * 2 + 8 * 3 = 50 + 24 = 74
            var totalEsperado = new BigDecimal("74.00");
            assertEquals(totalEsperado, response.totalAmount(), "Total deveria ser 74");
            assertEquals(2, response.items().size(), "Deveria ter 2 tipos de item");
        }

        @Test
        @DisplayName("Deve criar pedido com múltiplas formas de pagamento")
        void deveCriarPedidoComDiferentesPagamentos() {
            var item = new CreateOrderItemRequest(produtoTeste.getId(), 1);

            // Test PIX
            var requestPix = new CreateOrderRequest(PaymentMethod.PIX, DeliveryType.RETIRADA, null, null, List.of(item));
            var responsePix = orderService.createOrder(clienteTeste.getId(), requestPix);
            assertEquals(PaymentMethod.PIX, responsePix.paymentMethod(), "Deveria aceitar PIX");

            // Test CARTAO_CREDITO
            var requestCartao = new CreateOrderRequest(PaymentMethod.CARTAO_CREDITO, DeliveryType.RETIRADA, null, null, List.of(item));
            var responseCartao = orderService.createOrder(clienteTeste.getId(), requestCartao);
            assertEquals(PaymentMethod.CARTAO_CREDITO, responseCartao.paymentMethod(), "Deveria aceitar CARTÃO_CREDITO");

            // Test DINHEIRO
            var requestDinheiro = new CreateOrderRequest(PaymentMethod.DINHEIRO, DeliveryType.RETIRADA, null, null, List.of(item));
            var responseDinheiro = orderService.createOrder(clienteTeste.getId(), requestDinheiro);
            assertEquals(PaymentMethod.DINHEIRO, responseDinheiro.paymentMethod(), "Deveria aceitar DINHEIRO");
        }
    }

    @Nested
    @DisplayName("Validações e Erros")
    class ValidacoesErros {

        @Test
        @DisplayName("Deve rejeitar pedido de cliente inexistente")
        void deveRejetarClienteInexistente() {
            var item = new CreateOrderItemRequest(produtoTeste.getId(), 1);
            var request = new CreateOrderRequest(
                    PaymentMethod.PIX,
                    DeliveryType.RETIRADA,
                    null,
                    null,
                    List.of(item)
            );

            assertThrows(NotFoundException.class, () -> orderService.createOrder(9999L, request),
                "Deveria rejeitar cliente que não existe");
        }

        @Test
        @DisplayName("Deve rejeitar pedido com produto indisponível")
        void deveRejetarProdutoIndisponivel() {
            produtoTeste.setAvailable(false);
            productRepository.save(produtoTeste);

            var item = new CreateOrderItemRequest(produtoTeste.getId(), 1);
            var request = new CreateOrderRequest(
                    PaymentMethod.PIX,
                    DeliveryType.RETIRADA,
                    null,
                    null,
                    List.of(item)
            );

            assertThrows(BadRequestException.class, () -> orderService.createOrder(clienteTeste.getId(), request),
                "Deveria rejeitar produto indisponível");
        }

        @Test
        @DisplayName("Deve rejeitar entrega sem endereço")
        void deveRejetarEntregaSemEndereco() {
            var item = new CreateOrderItemRequest(produtoTeste.getId(), 1);
            var request = new CreateOrderRequest(
                    PaymentMethod.PIX,
                    DeliveryType.ENTREGA,
                    null,  // Sem endereço!
                    null,
                    List.of(item)
            );

            assertThrows(BadRequestException.class, () -> orderService.createOrder(clienteTeste.getId(), request),
                "Deveria rejeitar entrega sem endereço");
        }

        @Test
        @DisplayName("Deve rejeitar mesmo produto duplicado em um pedido")
        void deveRejetarProdutoDuplicado() {
            var item1 = new CreateOrderItemRequest(produtoTeste.getId(), 1);
            var item2 = new CreateOrderItemRequest(produtoTeste.getId(), 2);
            var request = new CreateOrderRequest(
                    PaymentMethod.PIX,
                    DeliveryType.RETIRADA,
                    null,
                    null,
                    List.of(item1, item2)
            );

            assertThrows(BadRequestException.class, () -> orderService.createOrder(clienteTeste.getId(), request),
                "Deveria rejeitar produto duplicado no mesmo pedido");
        }

        @Test
        @DisplayName("Deve rejeitar pedido com quantidade zero")
        void deveRejetarQuantidadeZero() {
            var item = new CreateOrderItemRequest(produtoTeste.getId(), 0);
            var request = new CreateOrderRequest(
                    PaymentMethod.PIX,
                    DeliveryType.RETIRADA,
                    null,
                    null,
                    List.of(item)
            );

            assertThrows(BadRequestException.class, () -> orderService.createOrder(clienteTeste.getId(), request),
                "Deveria rejeitar quantidade zero");
        }

        @Test
        @DisplayName("Deve rejeitar pedido com quantidade negativa")
        void deveRejetarQuantidadeNegativa() {
            var item = new CreateOrderItemRequest(produtoTeste.getId(), -5);
            var request = new CreateOrderRequest(
                    PaymentMethod.PIX,
                    DeliveryType.RETIRADA,
                    null,
                    null,
                    List.of(item)
            );

            assertThrows(BadRequestException.class, () -> orderService.createOrder(clienteTeste.getId(), request),
                "Deveria rejeitar quantidade negativa");
        }

        @Test
        @DisplayName("Deve rejeitar pedido vazio")
        void deveRejetarPedidoVazio() {
            var request = new CreateOrderRequest(
                    PaymentMethod.PIX,
                    DeliveryType.RETIRADA,
                    null,
                    null,
                    List.of()  // Lista vazia
            );

            assertThrows(BadRequestException.class, () -> orderService.createOrder(clienteTeste.getId(), request),
                "Deveria rejeitar pedido sem itens");
        }

        @Test
        @DisplayName("Deve rejeitar produto inexistente no pedido")
        void deveRejetarProdutoInexistente() {
            var item = new CreateOrderItemRequest(9999L, 1);  // ID que não existe
            var request = new CreateOrderRequest(
                    PaymentMethod.PIX,
                    DeliveryType.RETIRADA,
                    null,
                    null,
                    List.of(item)
            );

            assertThrows(NotFoundException.class, () -> orderService.createOrder(clienteTeste.getId(), request),
                "Deveria rejeitar produto que não existe");
        }
    }

    @Nested
    @DisplayName("Casos Específicos")
    class CasosEspecificos {

        @Test
        @DisplayName("Deve aceitar endereço com complemento vazio")
        void deveAceitarComplementoVazio() {
            var item = new CreateOrderItemRequest(produtoTeste.getId(), 1);
            var request = new CreateOrderRequest(
                    PaymentMethod.PIX,
                    DeliveryType.ENTREGA,
                    "Rua Principal, 123",
                    "",  // Complemento vazio
                    List.of(item)
            );

            var response = orderService.createOrder(clienteTeste.getId(), request);

            assertNotNull(response, "Deveria aceitar sem complemento");
        }
    }
}
