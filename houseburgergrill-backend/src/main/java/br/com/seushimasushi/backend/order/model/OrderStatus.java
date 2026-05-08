package br.com.seushimasushi.backend.order.model;

import java.util.Set;

public enum OrderStatus {
    CREATED,
    CONFIRMED,
    COMPLETED,
    CANCELLED;

    public boolean canTransitionTo(OrderStatus nextStatus) {
        if (this == nextStatus) {
            return true;
        }

        return switch (this) {
            case CREATED -> Set.of(CONFIRMED, CANCELLED).contains(nextStatus);
            case CONFIRMED -> Set.of(COMPLETED, CANCELLED).contains(nextStatus);
            case COMPLETED, CANCELLED -> false;
        };
    }
}
