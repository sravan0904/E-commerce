package com.shopsphere.service;

import com.shopsphere.dto.*;
import com.shopsphere.entity.*;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final CouponService couponService;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final ReturnRequestRepository returnRequestRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        CartRepository cartRepository,
                        CartItemRepository cartItemRepository,
                        UserRepository userRepository,
                        AddressRepository addressRepository,
                        ProductRepository productRepository,
                        CouponService couponService,
                        InventoryTransactionRepository inventoryTransactionRepository,
                        ReturnRequestRepository returnRequestRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.productRepository = productRepository;
        this.couponService = couponService;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.returnRequestRepository = returnRequestRepository;
    }

    @Transactional
    public OrderDto createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Address shippingAddress = addressRepository.findById(request.getShippingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipping Address", "id", request.getShippingAddressId()));

        if (!shippingAddress.getUser().getId().equals(userId)) {
            throw new BadRequestException("Invalid shipping address");
        }

        Address billingAddress = shippingAddress;
        if (request.getBillingAddressId() != null) {
            billingAddress = addressRepository.findById(request.getBillingAddressId())
                    .orElse(shippingAddress);
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot create an order with an empty cart");
        }

        // Validate stock and calculate total on backend
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem item : cart.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", item.getProduct().getId()));

            if (!product.isActive()) {
                throw new BadRequestException("Product '" + product.getName() + "' is no longer available");
            }

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product '" + product.getName() + "'. Available: " + product.getStockQuantity());
            }

            BigDecimal unitPrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemTotal);
        }

        // Coupon application
        BigDecimal discount = BigDecimal.ZERO;
        String couponCode = request.getCouponCode();
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            ApplyCouponResponse couponRes = couponService.validateAndApplyCoupon(couponCode, subtotal, userId);
            discount = couponRes.getDiscountAmount();
        }

        // Shipping calculation (free if subtotal >= 1000)
        BigDecimal shippingFee = subtotal.compareTo(BigDecimal.valueOf(1000)) >= 0 ? BigDecimal.ZERO : BigDecimal.valueOf(99);
        BigDecimal tax = BigDecimal.ZERO; // included in price
        BigDecimal finalAmount = subtotal.subtract(discount).add(shippingFee);

        // Build Order
        String orderNumber = "SP-" + System.currentTimeMillis() % 1000000 + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setUser(user);
        order.setShippingAddress(shippingAddress);
        order.setBillingAddress(billingAddress);
        order.setTotalAmount(subtotal);
        order.setDiscountAmount(discount);
        order.setShippingFee(shippingFee);
        order.setTaxAmount(tax);
        order.setFinalAmount(finalAmount);
        order.setCouponCode(couponCode);
        order.setPaymentMethod(request.getPaymentMethod().toUpperCase());
        order.setNotes(request.getNotes());
        order.setEstimatedDelivery(LocalDate.now().plusDays(4));

        if ("COD".equalsIgnoreCase(request.getPaymentMethod())) {
            order.setStatus("PLACED");
            order.setPaymentStatus("PENDING");
        } else {
            order.setStatus("PLACED");
            order.setPaymentStatus("PENDING");
        }

        Order savedOrder = orderRepository.save(order);

        // Create Order Items and deduct inventory safely
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            BigDecimal unitPrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setProductSku(product.getSku());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setTotalPrice(itemTotal);

            if (product.getImages() != null && !product.getImages().isEmpty()) {
                orderItem.setProductImage(product.getImages().get(0).getImageUrl());
            }

            savedOrder.addItem(orderItem);

            // Deduct stock safely
            int previousStock = product.getStockQuantity();
            int newStock = previousStock - item.getQuantity();
            product.setStockQuantity(newStock);
            productRepository.save(product);

            // Log inventory transaction
            InventoryTransaction it = new InventoryTransaction();
            it.setProduct(product);
            it.setTransactionType("ORDER_RESERVATION");
            it.setQuantity(-item.getQuantity());
            it.setPreviousStock(previousStock);
            it.setNewStock(newStock);
            it.setReferenceId(savedOrder.getOrderNumber());
            it.setNotes("Stock reserved for order " + savedOrder.getOrderNumber());
            inventoryTransactionRepository.save(it);
        }

        // Record coupon usage if applied
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            couponService.recordUsage(couponCode, user, savedOrder);
        }

        // Clear cart items
        cart.getItems().clear();
        cartRepository.save(cart);

        return mapToDto(savedOrder);
    }

    public List<OrderDto> getCustomerOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public OrderDto getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this order");
        }

        return mapToDto(order);
    }

    public OrderDto getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "number", orderNumber));
        return mapToDto(order);
    }

    @Transactional
    public OrderDto cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not own this order");
        }

        if (!"PLACED".equals(order.getStatus()) && !"CONFIRMED".equals(order.getStatus())) {
            throw new BadRequestException("Orders that have progressed to " + order.getStatus() + " cannot be cancelled");
        }

        order.setStatus("CANCELLED");
        if ("COMPLETED".equals(order.getPaymentStatus())) {
            order.setPaymentStatus("REFUNDED");
        }

        // Restock products
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                Product product = item.getProduct();
                int prev = product.getStockQuantity();
                int next = prev + item.getQuantity();
                product.setStockQuantity(next);
                productRepository.save(product);

                InventoryTransaction it = new InventoryTransaction();
                it.setProduct(product);
                it.setTransactionType("RETURN");
                it.setQuantity(item.getQuantity());
                it.setPreviousStock(prev);
                it.setNewStock(next);
                it.setReferenceId(order.getOrderNumber());
                it.setNotes("Restocked due to order cancellation " + order.getOrderNumber());
                inventoryTransactionRepository.save(it);
            }
        }

        Order saved = orderRepository.save(order);
        return mapToDto(saved);
    }

    @Transactional
    public ReturnRequestDto requestReturn(Long userId, ReturnRequestDto dto) {
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", dto.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("You do not own this order");
        }

        if (!"DELIVERED".equals(order.getStatus())) {
            throw new BadRequestException("Only delivered orders can be requested for return");
        }

        if (returnRequestRepository.existsByOrderId(order.getId())) {
            throw new BadRequestException("A return request has already been submitted for this order");
        }

        ReturnRequest rr = new ReturnRequest();
        rr.setOrder(order);
        rr.setUser(order.getUser());
        rr.setReason(dto.getReason());
        rr.setDetails(dto.getDetails());
        rr.setStatus("REQUESTED");
        rr.setRefundAmount(order.getFinalAmount());

        ReturnRequest saved = returnRequestRepository.save(rr);

        order.setStatus("RETURN_REQUESTED");
        orderRepository.save(order);

        ReturnRequestDto result = new ReturnRequestDto();
        result.setId(saved.getId());
        result.setOrderId(order.getId());
        result.setOrderNumber(order.getOrderNumber());
        result.setUserId(userId);
        result.setCustomerName(order.getUser().getFirstName() + " " + order.getUser().getLastName());
        result.setReason(saved.getReason());
        result.setDetails(saved.getDetails());
        result.setStatus(saved.getStatus());
        result.setRefundAmount(saved.getRefundAmount());
        result.setCreatedAt(saved.getCreatedAt());
        return result;
    }

    public Page<OrderDto> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToDto);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        order.setStatus(request.getStatus().toUpperCase());
        if (request.getTrackingNumber() != null && !request.getTrackingNumber().isBlank()) {
            order.setTrackingNumber(request.getTrackingNumber());
        }
        if ("DELIVERED".equalsIgnoreCase(request.getStatus()) && "COD".equalsIgnoreCase(order.getPaymentMethod())) {
            order.setPaymentStatus("COMPLETED");
        }

        Order saved = orderRepository.save(order);
        return mapToDto(saved);
    }

    public OrderDto mapToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setUserId(order.getUser().getId());
        dto.setCustomerName(order.getUser().getFirstName() + " " + order.getUser().getLastName());
        dto.setCustomerEmail(order.getUser().getEmail());

        if (order.getShippingAddress() != null) {
            AddressDto s = new AddressDto();
            s.setId(order.getShippingAddress().getId());
            s.setRecipientName(order.getShippingAddress().getRecipientName());
            s.setPhone(order.getShippingAddress().getPhone());
            s.setStreetAddress(order.getShippingAddress().getStreetAddress());
            s.setApartment(order.getShippingAddress().getApartment());
            s.setCity(order.getShippingAddress().getCity());
            s.setState(order.getShippingAddress().getState());
            s.setPostalCode(order.getShippingAddress().getPostalCode());
            s.setCountry(order.getShippingAddress().getCountry());
            dto.setShippingAddress(s);
        }

        dto.setTotalAmount(order.getTotalAmount());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setShippingFee(order.getShippingFee());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setFinalAmount(order.getFinalAmount());
        dto.setCouponCode(order.getCouponCode());
        dto.setStatus(order.getStatus());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setNotes(order.getNotes());
        dto.setTrackingNumber(order.getTrackingNumber());
        dto.setEstimatedDelivery(order.getEstimatedDelivery());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        for (OrderItem item : order.getItems()) {
            OrderItemDto itemDto = new OrderItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
            itemDto.setProductName(item.getProductName());
            itemDto.setProductImage(item.getProductImage());
            itemDto.setProductSku(item.getProductSku());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setUnitPrice(item.getUnitPrice());
            itemDto.setTotalPrice(item.getTotalPrice());
            dto.getItems().add(itemDto);
        }

        return dto;
    }
}
