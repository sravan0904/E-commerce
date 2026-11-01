package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.ApplyCouponRequest;
import com.shopsphere.dto.ApplyCouponResponse;
import com.shopsphere.dto.CouponDto;
import com.shopsphere.security.UserPrincipal;
import com.shopsphere.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<ApplyCouponResponse>> applyCoupon(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ApplyCouponRequest request) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : null;
        ApplyCouponResponse response = couponService.validateAndApplyCoupon(request.getCode(), request.getAmount(), userId);
        return ResponseEntity.ok(ApiResponse.ok("Coupon applied", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CouponDto>>> getAllCoupons() {
        List<CouponDto> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(ApiResponse.ok("Coupons fetched successfully", coupons));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponDto>> createCoupon(@Valid @RequestBody CouponDto dto) {
        CouponDto created = couponService.createCoupon(dto);
        return ResponseEntity.ok(ApiResponse.ok("Coupon created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CouponDto>> updateCoupon(@PathVariable Long id, @Valid @RequestBody CouponDto dto) {
        CouponDto updated = couponService.updateCoupon(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Coupon updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.ok("Coupon deleted successfully"));
    }
}
