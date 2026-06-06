package br.com.seushimasushi.backend.menu.service;

import br.com.seushimasushi.backend.common.exception.NotFoundException;
import br.com.seushimasushi.backend.menu.dto.store.BusinessHoursDayDto;
import br.com.seushimasushi.backend.menu.dto.store.PaymentMethodsConfigDto;
import br.com.seushimasushi.backend.menu.dto.store.StoreProfileDto;
import br.com.seushimasushi.backend.menu.dto.store.StoreSettingsResponse;
import br.com.seushimasushi.backend.menu.dto.store.UpdateStoreSettingsRequest;
import br.com.seushimasushi.backend.menu.model.StoreSettings;
import br.com.seushimasushi.backend.menu.repository.StoreSettingsRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreSettingsService {

    private static final int STORE_SETTINGS_ID = 1;
    private final StoreSettingsRepository storeSettingsRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public StoreSettingsResponse getPublic() {
        return toResponse(findByIdOneOrThrow());
    }

    @Transactional(readOnly = true)
    public StoreSettingsResponse getAdmin() {
        return toResponse(findByIdOneOrThrow());
    }

    @Transactional
    public StoreSettingsResponse update(UpdateStoreSettingsRequest request) {
        StoreSettings settings = findByIdOneOrThrow();

        settings.setStoreOpen(request.storeOpen());
        settings.setOpeningMessage(request.openingMessage().trim());
        settings.setClosingMessage(request.closingMessage().trim());
        settings.setWhatsappNumber(request.whatsappNumber().trim());
        settings.setDeliveryFee(request.deliveryFee());
        settings.setMinimumOrderValue(request.minimumOrderValue());
        settings.setEstimatedDeliveryTime(request.estimatedDeliveryTime());

        StoreProfileDto profile = request.storeProfile();
        if (profile != null) {
            settings.setStoreProfileLogoUrl(profile.logoUrl() != null ? profile.logoUrl() : "");
            settings.setStoreProfileCoverUrl(profile.coverUrl() != null ? profile.coverUrl() : "");
            settings.setStoreProfileAddressStreet(profile.addressStreet() != null ? profile.addressStreet() : "");
            settings.setStoreProfileAddressNumber(profile.addressNumber() != null ? profile.addressNumber() : "");
            settings.setStoreProfileNeighborhood(profile.neighborhood() != null ? profile.neighborhood() : "");
            settings.setStoreProfileCity(profile.city() != null ? profile.city() : "");
            settings.setStoreProfileZipCode(profile.zipCode() != null ? profile.zipCode() : "");
            settings.setStoreProfileReferencePoint(profile.referencePoint() != null ? profile.referencePoint() : "");
        }

        try {
            settings.setBusinessHoursJson(objectMapper.writeValueAsString(request.businessHours()));
        } catch (JsonProcessingException e) {
            settings.setBusinessHoursJson("[]");
        }

        if (request.paymentMethods() != null) {
            try {
                settings.setPaymentMethodsJson(objectMapper.writeValueAsString(request.paymentMethods()));
            } catch (JsonProcessingException e) {
                settings.setPaymentMethodsJson("{}");
            }
        }

        return toResponse(storeSettingsRepository.save(settings));
    }

    private StoreSettings findByIdOneOrThrow() {
        return storeSettingsRepository.findById(STORE_SETTINGS_ID)
                .orElseThrow(() -> new NotFoundException("Configuracao da loja nao encontrada"));
    }

    private StoreSettingsResponse toResponse(StoreSettings settings) {
        List<BusinessHoursDayDto> businessHours = parseBusinessHours(settings.getBusinessHoursJson());
        PaymentMethodsConfigDto paymentMethods = parsePaymentMethods(settings.getPaymentMethodsJson());

        return new StoreSettingsResponse(
                settings.getId(),
                settings.getStoreOpen(),
                settings.getOpeningMessage(),
                settings.getClosingMessage(),
                settings.getWhatsappNumber(),
                settings.getDeliveryFee(),
                settings.getMinimumOrderValue(),
                settings.getEstimatedDeliveryTime(),
                businessHours,
                paymentMethods,
                new StoreProfileDto(
                        settings.getStoreProfileLogoUrl(),
                        settings.getStoreProfileCoverUrl(),
                        settings.getStoreProfileAddressStreet(),
                        settings.getStoreProfileAddressNumber(),
                        settings.getStoreProfileNeighborhood(),
                        settings.getStoreProfileCity(),
                        settings.getStoreProfileZipCode(),
                        settings.getStoreProfileReferencePoint()
                )
        );
    }

    private List<BusinessHoursDayDto> parseBusinessHours(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<BusinessHoursDayDto>>() {});
        } catch (Exception e) {
            return Collections.nCopies(7, new BusinessHoursDayDto(0, false, "18:00", "23:00"));
        }
    }

    private PaymentMethodsConfigDto parsePaymentMethods(String json) {
        try {
            return objectMapper.readValue(json, PaymentMethodsConfigDto.class);
        } catch (Exception e) {
            return new PaymentMethodsConfigDto(true, true, true, true, false);
        }
    }
}
