package com.shopsphere.controller;

import com.shopsphere.dto.AddToCartRequest;
import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.CartDto;
import com.shopsphere.dto.UpdateCartItemRequest;
import com.shopsphere.security.UserPrincipal;
import com.shopsphere.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        CartDto cart = cartService.getCartDto(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Cart fetched successfully", cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> addToCart(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AddToCartRequest request) {
        CartDto cart = cartService.addToCart(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Item added to cart", cart));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartDto>> updateCartItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartDto cart = cartService.updateCartItem(userPrincipal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cart updated", cart));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartDto>> removeCartItem(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        CartDto cart = cartService.removeCartItem(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart", cart));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        cartService.clearCart(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Cart cleared successfully"));
    }
}
