package br.com.seushimasushi.backend.menu.dto.store;

public record PaymentMethodsConfigDto(
        boolean cash,
        boolean pix,
        boolean creditCard,
        boolean debitCard,
        boolean mealVoucher
) {
}
