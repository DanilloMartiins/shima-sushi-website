package br.com.seushimasushi.backend.menu.dto.store;

public record BusinessHoursDayDto(
        int dayOfWeek,
        boolean enabled,
        String openTime,
        String closeTime
) {
}
