package br.com.seushimasushi.backend.loyalty.service;

import br.com.seushimasushi.backend.common.exception.NotFoundException;
import br.com.seushimasushi.backend.loyalty.dto.request.LoyaltySettingsRequest;
import br.com.seushimasushi.backend.loyalty.dto.response.LoyaltyCardResponse;
import br.com.seushimasushi.backend.loyalty.dto.response.LoyaltySettingsResponse;
import br.com.seushimasushi.backend.loyalty.dto.response.LoyaltyTransactionResponse;
import br.com.seushimasushi.backend.loyalty.model.LoyaltyCard;
import br.com.seushimasushi.backend.loyalty.model.LoyaltySettings;
import br.com.seushimasushi.backend.loyalty.model.LoyaltyTransaction;
import br.com.seushimasushi.backend.loyalty.model.LoyaltyTransactionType;
import br.com.seushimasushi.backend.loyalty.repository.LoyaltyCardRepository;
import br.com.seushimasushi.backend.loyalty.repository.LoyaltySettingsRepository;
import br.com.seushimasushi.backend.loyalty.repository.LoyaltyTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class LoyaltyService {

    private final LoyaltySettingsRepository settingsRepository;
    private final LoyaltyCardRepository cardRepository;
    private final LoyaltyTransactionRepository transactionRepository;

    public LoyaltyService(LoyaltySettingsRepository settingsRepository,
                          LoyaltyCardRepository cardRepository,
                          LoyaltyTransactionRepository transactionRepository) {
        this.settingsRepository = settingsRepository;
        this.cardRepository = cardRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public LoyaltySettingsResponse getSettings() {
        LoyaltySettings settings = settingsRepository.findById(1L)
                .orElseThrow(() -> new NotFoundException("Configuração de fidelidade não encontrada"));
        return toSettingsResponse(settings);
    }

    @Transactional
    public LoyaltySettingsResponse updateSettings(LoyaltySettingsRequest request) {
        LoyaltySettings settings = settingsRepository.findById(1L)
                .orElseThrow(() -> new NotFoundException("Configuração de fidelidade não encontrada"));

        if (request.stampsNeeded() != null) {
            settings.setStampsNeeded(request.stampsNeeded());
        }
        if (request.prizeDescription() != null) {
            settings.setPrizeDescription(request.prizeDescription());
        }
        if (request.minOrderAmount() != null) {
            settings.setMinOrderAmount(request.minOrderAmount());
        }

        settingsRepository.save(settings);
        return toSettingsResponse(settings);
    }

    @Transactional(readOnly = true)
    public LoyaltyCardResponse getCardByCustomerClerkId(String clerkId) {
        LoyaltyCard card = cardRepository.findByCustomerClerkId(clerkId)
                .orElse(null);

        if (card == null) {
            return null;
        }

        LoyaltySettings settings = settingsRepository.findById(1L)
                .orElseThrow(() -> new NotFoundException("Configuração de fidelidade não encontrada"));

        List<LoyaltyTransaction> transactions = transactionRepository.findByCardIdOrderByCreatedAtDesc(card.getId());

        return toCardResponse(card, settings, transactions);
    }

    @Transactional
    public void criarCartaoSeNecessario(String customerClerkId) {
        if (cardRepository.findByCustomerClerkId(customerClerkId).isEmpty()) {
            LoyaltyCard card = new LoyaltyCard();
            card.setCustomerClerkId(customerClerkId);
            card.setStamps(0);
            cardRepository.save(card);
        }
    }

    @Transactional
    public void adicionarSelo(String customerClerkId, Long orderId, BigDecimal orderAmount) {
        LoyaltySettings settings = settingsRepository.findById(1L)
                .orElseThrow(() -> new NotFoundException("Configuração de fidelidade não encontrada"));

        if (!Boolean.TRUE.equals(settings.getActive())) {
            return;
        }

        if (orderAmount.compareTo(settings.getMinOrderAmount()) < 0) {
            return;
        }

        LoyaltyCard card = cardRepository.findByCustomerClerkId(customerClerkId)
                .orElseGet(() -> {
                    LoyaltyCard newCard = new LoyaltyCard();
                    newCard.setCustomerClerkId(customerClerkId);
                    newCard.setStamps(0);
                    return cardRepository.save(newCard);
                });

        card.setStamps(card.getStamps() + 1);
        cardRepository.save(card);

        LoyaltyTransaction transaction = new LoyaltyTransaction();
        transaction.setCard(card);
        transaction.setType(LoyaltyTransactionType.EARNED);
        transaction.setOrderId(orderId);
        transaction.setDescription("Selo ganho pelo pedido #" + orderId);
        transactionRepository.save(transaction);
    }

    @Transactional
    public void resgatarPremio(String customerClerkId) {
        LoyaltyCard card = cardRepository.findByCustomerClerkId(customerClerkId)
                .orElseThrow(() -> new NotFoundException("Cartão fidelidade não encontrado"));

        LoyaltySettings settings = settingsRepository.findById(1L)
                .orElseThrow(() -> new NotFoundException("Configuração de fidelidade não encontrada"));

        if (card.getStamps() < settings.getStampsNeeded()) {
            throw new IllegalStateException("Selos insuficientes: " + card.getStamps()
                    + "/" + settings.getStampsNeeded());
        }

        card.setStamps(card.getStamps() - settings.getStampsNeeded());
        cardRepository.save(card);

        LoyaltyTransaction transaction = new LoyaltyTransaction();
        transaction.setCard(card);
        transaction.setType(LoyaltyTransactionType.REDEEMED);
        transaction.setOrderId(null);
        transaction.setDescription("Prêmio resgatado: " + settings.getPrizeDescription());
        transactionRepository.save(transaction);
    }

    private LoyaltySettingsResponse toSettingsResponse(LoyaltySettings settings) {
        return new LoyaltySettingsResponse(
                settings.getStampsNeeded(),
                settings.getPrizeDescription(),
                settings.getMinOrderAmount(),
                settings.getActive()
        );
    }

    private LoyaltyCardResponse toCardResponse(LoyaltyCard card, LoyaltySettings settings,
                                                List<LoyaltyTransaction> transactions) {
        List<LoyaltyTransactionResponse> transactionResponses = transactions.stream()
                .map(t -> new LoyaltyTransactionResponse(
                        t.getId(),
                        t.getType().name(),
                        t.getOrderId(),
                        t.getDescription(),
                        t.getCreatedAt()
                ))
                .toList();

        return new LoyaltyCardResponse(
                card.getId(),
                card.getStamps(),
                settings.getStampsNeeded(),
                settings.getPrizeDescription(),
                transactionResponses
        );
    }
}
