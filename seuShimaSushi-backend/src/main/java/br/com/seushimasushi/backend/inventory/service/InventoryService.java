package br.com.seushimasushi.backend.inventory.service;

import br.com.seushimasushi.backend.inventory.dto.InventoryExitRequest;
import br.com.seushimasushi.backend.inventory.dto.InventoryItemRequest;
import br.com.seushimasushi.backend.inventory.dto.InventoryItemResponse;
import br.com.seushimasushi.backend.inventory.model.InventoryItem;
import br.com.seushimasushi.backend.inventory.model.InventoryTransaction;
import br.com.seushimasushi.backend.inventory.repository.InventoryItemRepository;
import br.com.seushimasushi.backend.inventory.repository.InventoryTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {

    private final InventoryItemRepository itemRepository;
    private final InventoryTransactionRepository transactionRepository;

    public InventoryService(InventoryItemRepository itemRepository,
                            InventoryTransactionRepository transactionRepository) {
        this.itemRepository = itemRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<InventoryItemResponse> listar() {
        return itemRepository.findAll().stream()
                .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                .map(this::paraResponse)
                .toList();
    }

    public InventoryItemResponse buscarPorId(Long id) {
        InventoryItem item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item nao encontrado"));
        return paraResponse(item);
    }

    @Transactional
    public InventoryItemResponse cadastrar(InventoryItemRequest request, String nomeCriador) {
        InventoryItem item = new InventoryItem();
        item.setName(request.name().trim());
        item.setQuantity(request.quantity() != null ? request.quantity() : 0);
        item.setMinQuantity(request.minQuantity() != null ? request.minQuantity() : 0);
        item.setUnit(request.unit());
        item.setCreatedBy(nomeCriador);

        InventoryItem salvo = itemRepository.save(item);
        return paraResponse(salvo);
    }

    @Transactional
    public InventoryItemResponse atualizar(Long id, InventoryItemRequest request, boolean isSuperAdmin) {
        InventoryItem item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item nao encontrado"));

        item.setName(request.name().trim());
        item.setQuantity(request.quantity() != null ? request.quantity() : 0);
        item.setUnit(request.unit());

        if (isSuperAdmin && request.minQuantity() != null) {
            item.setMinQuantity(request.minQuantity());
        }

        InventoryItem salvo = itemRepository.save(item);
        return paraResponse(salvo);
    }

    @Transactional
    public void deletar(Long id) {
        InventoryItem item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item nao encontrado"));
        itemRepository.delete(item);
    }

    @Transactional
    public InventoryItemResponse registrarSaida(Long id, InventoryExitRequest request, String nomeAutor) {
        InventoryItem item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Item nao encontrado"));

        if (item.getQuantity() < request.quantity()) {
            throw new IllegalArgumentException(
                    "Estoque insuficiente. Tem " + item.getQuantity() + " " + item.getUnit() +
                    ", pedido " + request.quantity() + " " + item.getUnit());
        }

        item.setQuantity(item.getQuantity() - request.quantity());
        itemRepository.save(item);

        InventoryTransaction transacao = new InventoryTransaction();
        transacao.setItem(item);
        transacao.setType("EXIT");
        transacao.setQuantity(request.quantity());
        transacao.setReason(request.reason() != null ? request.reason().trim() : "");
        transacao.setCreatedBy(nomeAutor);
        transactionRepository.save(transacao);

        return paraResponse(item);
    }

    public List<InventoryTransaction> historico(Long itemId) {
        return transactionRepository.findByItemIdOrderByCreatedAtDesc(itemId);
    }

    private InventoryItemResponse paraResponse(InventoryItem item) {
        return new InventoryItemResponse(
                item.getId(),
                item.getName(),
                item.getQuantity(),
                item.getMinQuantity(),
                item.getUnit(),
                item.getCreatedBy(),
                item.getMinQuantity() > 0 && item.getQuantity() <= item.getMinQuantity(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
