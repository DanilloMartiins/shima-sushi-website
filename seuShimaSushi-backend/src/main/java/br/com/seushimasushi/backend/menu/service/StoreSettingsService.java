package br.com.seushimasushi.backend.menu.service;

import br.com.seushimasushi.backend.common.exception.NotFoundException;
import br.com.seushimasushi.backend.menu.dto.store.StoreSettingsResponse;
import br.com.seushimasushi.backend.menu.dto.store.UpdateStoreSettingsRequest;
import br.com.seushimasushi.backend.menu.model.StoreSettings;
import br.com.seushimasushi.backend.menu.repository.StoreSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StoreSettingsService {

    private static final int STORE_SETTINGS_ID = 1;
    private final StoreSettingsRepository storeSettingsRepository;

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

        return toResponse(storeSettingsRepository.save(settings));
    }

    private StoreSettings findByIdOneOrThrow() {
        return storeSettingsRepository.findById(STORE_SETTINGS_ID)
                .orElseThrow(() -> new NotFoundException("Configuracao da loja nao encontrada"));
    }

    private StoreSettingsResponse toResponse(StoreSettings settings) {
        return new StoreSettingsResponse(
                settings.getId(),
                settings.getStoreOpen(),
                settings.getOpeningMessage(),
                settings.getClosingMessage(),
                settings.getWhatsappNumber(),
                settings.getDeliveryFee(),
                settings.getMinimumOrderValue()
        );
    }
}
