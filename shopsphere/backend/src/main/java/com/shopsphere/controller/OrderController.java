package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.CreateOrderRequest;
import com.shopsphere.dto.OrderDto;
import com.shopsphere.dto.ReturnRequestDto;
import com.shopsphere.security.UserPrincipal;
import com.shopsphere.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> createOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderDto order = orderService.createOrder(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Order placed successfully", order));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDto>>> getCustomerOrders(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<OrderDto> orders = orderService.getCustomerOrders(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Orders fetched successfully", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        OrderDto order = orderService.getOrderById(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Order fetched successfully", order));
    }

    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderDto>> trackOrder(@PathVariable String orderNumber) {
        OrderDto order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.ok("Order tracking data", order));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        OrderDto order = orderService.cancelOrder(userPrincipal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled successfully", order));
    }

    @PostMapping("/return")
    public ResponseEntity<ApiResponse<ReturnRequestDto>> requestReturn(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ReturnRequestDto dto) {
        ReturnRequestDto result = orderService.requestReturn(userPrincipal.getId(), dto);
        return ResponseEntity.ok(ApiResponse.ok("Return request submitted successfully", result));
    }
}
