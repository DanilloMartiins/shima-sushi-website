package br.com.seushimasushi.backend.menu.dto.store;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record UpdateStoreSettingsRequest(
        @NotNull(message = "Status da loja e obrigatorio")
        Boolean storeOpen,

        @NotBlank(message = "Mensagem de abertura e obrigatoria")
        @Size(max = 255, message = "Mensagem de abertura deve ter no maximo 255 caracteres")
        String openingMessage,

        @NotBlank(message = "Mensagem de fechamento e obrigatoria")
        @Size(max = 255, message = "Mensagem de fechamento deve ter no maximo 255 caracteres")
        String closingMessage,

        @NotBlank(message = "WhatsApp e obrigatorio")
        @Size(max = 30, message = "WhatsApp deve ter no maximo 30 caracteres")
        String whatsappNumber,

        @NotNull(message = "Taxa de entrega e obrigatoria")
        @DecimalMin(value = "0.00", message = "Taxa de entrega nao pode ser negativa")
        BigDecimal deliveryFee,

        @NotNull(message = "Pedido minimo e obrigatorio")
        @DecimalMin(value = "0.00", message = "Pedido minimo nao pode ser negativo")
        BigDecimal minimumOrderValue,

        @NotBlank(message = "Tempo estimado de entrega e obrigatorio")
        String estimatedDeliveryTime,

        @NotNull(message = "Horarios de funcionamento sao obrigatorios")
        List<BusinessHoursDayDto> businessHours,

        @NotNull(message = "Metodos de pagamento sao obrigatorios")
        PaymentMethodsConfigDto paymentMethods,

        @NotNull(message = "Perfil da loja e obrigatorio")
        StoreProfileDto storeProfile
) {
}
