package br.com.seushimasushi.backend.order.model;

import java.util.Set;

public enum OrderStatus {
    CREATED,
    PENDING_PAYMENT,
    CONFIRMED,
    PREPARING,
    OUT_FOR_DELIVERY,
    COMPLETED,
    CANCELLED;

    public boolean canTransitionTo(OrderStatus nextStatus) {
        if (this == nextStatus) {
            return true;
        }

        return switch (this) {
            case CREATED -> Set.of(PENDING_PAYMENT, CANCELLED).contains(nextStatus);
            case PENDING_PAYMENT -> Set.of(CONFIRMED, CANCELLED).contains(nextStatus);
            case CONFIRMED -> Set.of(PREPARING, CANCELLED).contains(nextStatus);
            case PREPARING -> Set.of(OUT_FOR_DELIVERY, CANCELLED).contains(nextStatus);
            case OUT_FOR_DELIVERY -> Set.of(COMPLETED, CANCELLED).contains(nextStatus);
            case COMPLETED, CANCELLED -> false;
        };
    }
}
