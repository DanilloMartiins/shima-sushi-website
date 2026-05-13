package br.com.seushimasushi.backend.address.service;

import br.com.seushimasushi.backend.address.dto.AddressRequest;
import br.com.seushimasushi.backend.address.dto.AddressResponse;
import br.com.seushimasushi.backend.address.model.Address;
import br.com.seushimasushi.backend.address.repository.AddressRepository;
import br.com.seushimasushi.backend.common.exception.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    @Autowired
    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> listMyAddresses(String clerkUserId) {
        List<Address> addresses = addressRepository.findByClerkUserId(clerkUserId);
        List<AddressResponse> responses = new ArrayList<>();
        for (Address addr : addresses) {
            responses.add(mapToResponse(addr));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public AddressResponse getDefaultAddress(String clerkUserId) {
        return addressRepository.findByClerkUserIdAndIsDefaultTrue(clerkUserId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Transactional
    public AddressResponse save(String clerkUserId, AddressRequest request) {
        if (Boolean.TRUE.equals(request.isDefault())) {
            unsetDefaultAddress(clerkUserId);
        }

        Address address = new Address(
                clerkUserId,
                request.street(),
                request.number(),
                request.neighborhood(),
                request.city(),
                request.zipCode(),
                request.complement(),
                request.referencePoint(),
                request.isDefault() != null ? request.isDefault() : false
        );

        Address saved = addressRepository.save(address);
        return mapToResponse(saved);
    }

    @Transactional
    public AddressResponse update(String clerkUserId, Long addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new NotFoundException("Endereço não encontrado"));

        if (!address.getClerkUserId().equals(clerkUserId)) {
            throw new IllegalArgumentException("Permissão negada");
        }

        if (Boolean.TRUE.equals(request.isDefault())) {
            unsetDefaultAddress(clerkUserId);
        }

        address.setStreet(request.street());
        address.setNumber(request.number());
        address.setNeighborhood(request.neighborhood());
        address.setCity(request.city());
        address.setZipCode(request.zipCode());
        address.setComplement(request.complement());
        address.setReferencePoint(request.referencePoint());
        address.setIsDefault(request.isDefault() != null ? request.isDefault() : address.getIsDefault());

        Address updated = addressRepository.save(address);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(String clerkUserId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new NotFoundException("Endereço não encontrado"));

        if (!address.getClerkUserId().equals(clerkUserId)) {
            throw new IllegalArgumentException("Permissão negada");
        }

        addressRepository.delete(address);
    }

    private void unsetDefaultAddress(String clerkUserId) {
        addressRepository.findByClerkUserIdAndIsDefaultTrue(clerkUserId)
                .ifPresent(addr -> {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                });
    }

    private AddressResponse mapToResponse(Address addr) {
        return new AddressResponse(
                addr.getId(),
                addr.getStreet(),
                addr.getNumber(),
                addr.getNeighborhood(),
                addr.getCity(),
                addr.getComplement(),
                addr.getReferencePoint(),
                addr.getIsDefault(),
                addr.getCreatedAt()
        );
    }
}
