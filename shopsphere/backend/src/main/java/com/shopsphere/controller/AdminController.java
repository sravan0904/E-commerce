package com.shopsphere.controller;

import com.shopsphere.dto.*;
import com.shopsphere.entity.InventoryTransaction;
import com.shopsphere.entity.ReturnRequest;
import com.shopsphere.repository.InventoryTransactionRepository;
import com.shopsphere.repository.ReturnRequestRepository;
import com.shopsphere.service.AdminService;
import com.shopsphere.service.OrderService;
import com.shopsphere.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;
    private final ProductService productService;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final ReturnRequestRepository returnRequestRepository;

    public AdminController(AdminService adminService,
                           OrderService orderService,
                           ProductService productService,
                           InventoryTransactionRepository inventoryTransactionRepository,
                           ReturnRequestRepository returnRequestRepository) {
        this.adminService = adminService;
        this.orderService = orderService;
        this.productService = productService;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.returnRequestRepository = returnRequestRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        DashboardStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok("Dashboard statistics fetched", stats));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<OrderDto> orders = orderService.getAllOrders(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok("Orders fetched", orders));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderDto order = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Order status updated", order));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResponse<Page<UserProfileDto>>> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<UserProfileDto> customers = adminService.getCustomers(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok("Customers fetched", customers));
    }

    @PutMapping("/customers/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UserProfileDto>> toggleCustomerStatus(@PathVariable Long id) {
        UserProfileDto updated = adminService.toggleCustomerStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("Customer status updated", updated));
    }

    @GetMapping("/inventory/transactions")
    public ResponseEntity<ApiResponse<Page<InventoryTransaction>>> getInventoryTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<InventoryTransaction> transactions = inventoryTransactionRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok("Inventory transactions fetched", transactions));
    }

    @PutMapping("/inventory/{productId}")
    public ResponseEntity<ApiResponse<ProductDto>> updateStock(
            @PathVariable Long productId,
            @Valid @RequestBody InventoryUpdateDto dto) {
        ProductDto updated = productService.updateStock(productId, dto.getQuantityChange(), dto.getTransactionType(), dto.getNotes());
        return ResponseEntity.ok(ApiResponse.ok("Stock updated successfully", updated));
    }

    @GetMapping("/returns")
    public ResponseEntity<ApiResponse<Page<ReturnRequest>>> getReturnRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<ReturnRequest> requests = returnRequestRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok("Return requests fetched", requests));
    }

    @PutMapping("/returns/{id}")
    public ResponseEntity<ApiResponse<ReturnRequest>> updateReturnRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        ReturnRequest updated = adminService.updateReturnRequestStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Return request status updated", updated));
    }
}
