package com.shopsphere.service;

import com.shopsphere.dto.WishlistDto;
import com.shopsphere.entity.*;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.repository.WishlistItemRepository;
import com.shopsphere.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public WishlistService(WishlistRepository wishlistRepository,
                           WishlistItemRepository wishlistItemRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.wishlistItemRepository = wishlistItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Wishlist getOrCreateWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            Wishlist wishlist = new Wishlist();
            wishlist.setUser(user);
            return wishlistRepository.save(wishlist);
        });
    }

    @Transactional(readOnly = true)
    public WishlistDto getWishlist(Long userId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        return mapToWishlistDto(wishlist);
    }

    @Transactional
    public WishlistDto addToWishlist(Long userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Optional<WishlistItem> existing = wishlistItemRepository.findByWishlistIdAndProductId(wishlist.getId(), product.getId());
        if (existing.isEmpty()) {
            WishlistItem item = new WishlistItem(wishlist, product);
            wishlist.addItem(item);
            wishlistItemRepository.save(item);
        }

        return mapToWishlistDto(wishlistRepository.findById(wishlist.getId()).orElse(wishlist));
    }

    @Transactional
    public WishlistDto removeFromWishlist(Long userId, Long productId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        wishlistItemRepository.deleteByWishlistIdAndProductId(wishlist.getId(), productId);
        return mapToWishlistDto(wishlistRepository.findById(wishlist.getId()).orElse(wishlist));
    }

    private WishlistDto mapToWishlistDto(Wishlist wishlist) {
        WishlistDto dto = new WishlistDto();
        dto.setId(wishlist.getId());

        for (WishlistItem item : wishlist.getItems()) {
            Product p = item.getProduct();
            WishlistDto.WishlistItemDto itemDto = new WishlistDto.WishlistItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(p.getId());
            itemDto.setProductName(p.getName());
            itemDto.setProductSlug(p.getSlug());
            itemDto.setBrand(p.getBrand());
            itemDto.setPrice(p.getPrice());
            itemDto.setDiscountPrice(p.getDiscountPrice());
            itemDto.setStockQuantity(p.getStockQuantity());

            if (p.getImages() != null && !p.getImages().isEmpty()) {
                itemDto.setProductImage(p.getImages().get(0).getImageUrl());
            }

            dto.getItems().add(itemDto);
        }

        return dto;
    }
}
