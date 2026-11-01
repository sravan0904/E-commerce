package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.WishlistDto;
import com.shopsphere.security.UserPrincipal;
import com.shopsphere.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<WishlistDto>> getWishlist(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        WishlistDto wishlist = wishlistService.getWishlist(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Wishlist fetched successfully", wishlist));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistDto>> addToWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId) {
        WishlistDto wishlist = wishlistService.addToWishlist(userPrincipal.getId(), productId);
        return ResponseEntity.ok(ApiResponse.ok("Added to wishlist", wishlist));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistDto>> removeFromWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long productId) {
        WishlistDto wishlist = wishlistService.removeFromWishlist(userPrincipal.getId(), productId);
        return ResponseEntity.ok(ApiResponse.ok("Removed from wishlist", wishlist));
    }
}
