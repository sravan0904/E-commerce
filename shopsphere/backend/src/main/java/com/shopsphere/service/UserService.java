package com.shopsphere.service;

import com.shopsphere.dto.AddressDto;
import com.shopsphere.dto.UserProfileDto;
import com.shopsphere.entity.Address;
import com.shopsphere.entity.Role;
import com.shopsphere.entity.User;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.AddressRepository;
import com.shopsphere.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public UserService(UserRepository userRepository, AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return mapToProfileDto(user);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UserProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setFirstName(dto.getFirstName().trim());
        user.setLastName(dto.getLastName().trim());
        user.setPhone(dto.getPhone());
        if (dto.getAvatarUrl() != null) {
            user.setAvatarUrl(dto.getAvatarUrl());
        }

        User saved = userRepository.save(user);
        return mapToProfileDto(saved);
    }

    public List<AddressDto> getUserAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDesc(userId).stream()
                .map(this::mapToAddressDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDto addAddress(Long userId, AddressDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Address address = new Address();
        address.setUser(user);
        address.setRecipientName(dto.getRecipientName().trim());
        address.setPhone(dto.getPhone().trim());
        address.setStreetAddress(dto.getStreetAddress().trim());
        address.setApartment(dto.getApartment());
        address.setCity(dto.getCity().trim());
        address.setState(dto.getState().trim());
        address.setPostalCode(dto.getPostalCode().trim());
        address.setCountry(dto.getCountry() != null ? dto.getCountry() : "India");
        address.setAddressType(dto.getAddressType() != null ? dto.getAddressType() : "SHIPPING");

        List<Address> existing = addressRepository.findByUserId(userId);
        if (existing.isEmpty() || dto.isDefault()) {
            if (dto.isDefault()) {
                existing.forEach(a -> a.setDefault(false));
                addressRepository.saveAll(existing);
            }
            address.setDefault(true);
        } else {
            address.setDefault(false);
        }

        Address saved = addressRepository.save(address);
        return mapToAddressDto(saved);
    }

    @Transactional
    public AddressDto updateAddress(Long userId, Long addressId, AddressDto dto) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not own this address");
        }

        address.setRecipientName(dto.getRecipientName().trim());
        address.setPhone(dto.getPhone().trim());
        address.setStreetAddress(dto.getStreetAddress().trim());
        address.setApartment(dto.getApartment());
        address.setCity(dto.getCity().trim());
        address.setState(dto.getState().trim());
        address.setPostalCode(dto.getPostalCode().trim());
        address.setCountry(dto.getCountry() != null ? dto.getCountry() : "India");
        address.setAddressType(dto.getAddressType() != null ? dto.getAddressType() : "SHIPPING");

        if (dto.isDefault() && !address.isDefault()) {
            List<Address> existing = addressRepository.findByUserId(userId);
            existing.forEach(a -> a.setDefault(false));
            addressRepository.saveAll(existing);
            address.setDefault(true);
        }

        Address saved = addressRepository.save(address);
        return mapToAddressDto(saved);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not own this address");
        }

        addressRepository.delete(address);
    }

    private UserProfileDto mapToProfileDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setEnabled(user.isEnabled());
        dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
        return dto;
    }

    private AddressDto mapToAddressDto(Address address) {
        AddressDto dto = new AddressDto();
        dto.setId(address.getId());
        dto.setRecipientName(address.getRecipientName());
        dto.setPhone(address.getPhone());
        dto.setStreetAddress(address.getStreetAddress());
        dto.setApartment(address.getApartment());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setPostalCode(address.getPostalCode());
        dto.setCountry(address.getCountry());
        dto.setAddressType(address.getAddressType());
        dto.setDefault(address.isDefault());
        return dto;
    }
}
