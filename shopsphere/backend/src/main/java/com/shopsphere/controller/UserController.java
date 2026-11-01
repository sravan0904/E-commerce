package com.shopsphere.controller;

import com.shopsphere.dto.AddressDto;
import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.UserProfileDto;
import com.shopsphere.security.UserPrincipal;
import com.shopsphere.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserProfileDto profile = userService.getProfile(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Profile fetched successfully", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UserProfileDto dto) {
        UserProfileDto updated = userService.updateProfile(userPrincipal.getId(), dto);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<AddressDto>>> getAddresses(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AddressDto> addresses = userService.getUserAddresses(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Addresses fetched successfully", addresses));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressDto>> addAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AddressDto dto) {
        AddressDto created = userService.addAddress(userPrincipal.getId(), dto);
        return ResponseEntity.ok(ApiResponse.ok("Address added successfully", created));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody AddressDto dto) {
        AddressDto updated = userService.updateAddress(userPrincipal.getId(), id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Address updated successfully", updated));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        userService.deleteAddress(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Address deleted successfully"));
    }
}
