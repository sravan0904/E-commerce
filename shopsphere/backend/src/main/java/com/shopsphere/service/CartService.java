package com.shopsphere.service;

import com.shopsphere.dto.AddToCartRequest;
import com.shopsphere.dto.CartDto;
import com.shopsphere.dto.CartItemDto;
import com.shopsphere.dto.UpdateCartItemRequest;
import com.shopsphere.entity.*;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.CartRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }

    @Transactional(readOnly = true)
    public CartDto getCartDto(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToCartDto(cart);
    }

    @Transactional
    public CartDto addToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("This product is currently unavailable");
        }

        if (product.getStockQuantity() <= 0) {
            throw new BadRequestException("Product is out of stock");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (newQuantity > product.getStockQuantity()) {
                throw new BadRequestException("Cannot add more. Only " + product.getStockQuantity() + " units available.");
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            if (request.getQuantity() > product.getStockQuantity()) {
                throw new BadRequestException("Cannot add requested quantity. Only " + product.getStockQuantity() + " units available.");
            }
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            BigDecimal effectivePrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            newItem.setPriceAtAddition(effectivePrice);
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        return mapToCartDto(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public CartDto updateCartItem(Long userId, Long cartItemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("This cart item does not belong to your cart");
        }

        Product product = item.getProduct();
        if (request.getQuantity() > product.getStockQuantity()) {
            throw new BadRequestException("Only " + product.getStockQuantity() + " units available");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return mapToCartDto(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public CartDto removeCartItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("This cart item does not belong to your cart");
        }

        cart.removeItem(item);
        cartItemRepository.delete(item);

        return mapToCartDto(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    public CartDto mapToCartDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());

        BigDecimal subtotal = BigDecimal.ZERO;
        int totalQuantity = 0;

        for (CartItem item : cart.getItems()) {
            Product p = item.getProduct();
            BigDecimal unitPrice = p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemTotal);
            totalQuantity += item.getQuantity();

            CartItemDto itemDto = new CartItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(p.getId());
            itemDto.setProductName(p.getName());
            itemDto.setProductSlug(p.getSlug());
            itemDto.setBrand(p.getBrand());
            itemDto.setPrice(p.getPrice());
            itemDto.setDiscountPrice(p.getDiscountPrice());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setStockQuantity(p.getStockQuantity());
            itemDto.setSubtotal(itemTotal);

            if (p.getImages() != null && !p.getImages().isEmpty()) {
                itemDto.setProductImage(p.getImages().get(0).getImageUrl());
            }

            dto.getItems().add(itemDto);
        }

        dto.setSubtotal(subtotal);
        dto.setTotalItems(totalQuantity);

        // Free shipping if order > 1000
        BigDecimal shippingFee = (subtotal.compareTo(BigDecimal.valueOf(1000)) >= 0 || subtotal.compareTo(BigDecimal.ZERO) == 0)
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(99);
        dto.setShippingFee(shippingFee);

        dto.setTotal(subtotal.add(shippingFee));
        return dto;
    }
}
