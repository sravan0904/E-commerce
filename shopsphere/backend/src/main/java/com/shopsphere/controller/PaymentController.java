package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.PaymentOrderRequest;
import com.shopsphere.dto.PaymentOrderResponse;
import com.shopsphere.dto.PaymentVerifyRequest;
import com.shopsphere.security.UserPrincipal;
import com.shopsphere.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> createPaymentOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PaymentOrderRequest request) {
        PaymentOrderResponse response = paymentService.createPaymentOrder(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Payment order created", response));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Boolean>> verifyPayment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PaymentVerifyRequest request) {
        boolean verified = paymentService.verifyPayment(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Payment verified successfully", verified));
    }
}
