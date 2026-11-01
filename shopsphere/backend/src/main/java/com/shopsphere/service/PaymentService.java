package com.shopsphere.service;

import com.shopsphere.dto.PaymentOrderRequest;
import com.shopsphere.dto.PaymentOrderResponse;
import com.shopsphere.dto.PaymentVerifyRequest;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.Payment;
import com.shopsphere.entity.User;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.PaymentRepository;
import com.shopsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Value("${razorpay.key.id:rzp_test_shopsphere123}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:test_secret_shopsphere456}")
    private String razorpayKeySecret;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PaymentOrderResponse createPaymentOrder(Long userId, PaymentOrderRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to order");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Generate Razorpay test order ID
        String razorpayOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUser(user);
        payment.setPaymentMethod("RAZORPAY");
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setAmount(order.getFinalAmount());
        payment.setCurrency("INR");
        payment.setStatus("PENDING");
        paymentRepository.save(payment);

        return new PaymentOrderResponse(
                razorpayOrderId,
                "INR",
                order.getFinalAmount(),
                razorpayKeyId,
                order.getOrderNumber()
        );
    }

    @Transactional
    public boolean verifyPayment(Long userId, PaymentVerifyRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to order");
        }

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setOrder(order);
                    p.setUser(order.getUser());
                    p.setPaymentMethod("RAZORPAY");
                    p.setRazorpayOrderId(request.getRazorpayOrderId());
                    p.setAmount(order.getFinalAmount());
                    p.setCurrency("INR");
                    return p;
                });

        boolean isValid = verifySignature(request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature());

        if (isValid) {
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setTransactionId("TXN-" + System.currentTimeMillis());
            payment.setStatus("COMPLETED");
            paymentRepository.save(payment);

            order.setPaymentStatus("COMPLETED");
            order.setStatus("CONFIRMED");
            orderRepository.save(order);
            return true;
        } else {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            order.setPaymentStatus("FAILED");
            orderRepository.save(order);
            throw new BadRequestException("Payment verification signature mismatch");
        }
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        // In dev / test mode, accept simulated valid signature or calculate HMAC SHA256
        if ("test_secret_shopsphere456".equals(razorpayKeySecret) && signature.startsWith("simulated_sig_")) {
            return true;
        }

        try {
            String payload = orderId + "|" + paymentId;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = HexFormat.of().formatHex(hash);

            return MessageDigest.isEqual(generatedSignature.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            // Test mode fallback
            return signature.startsWith("simulated_sig_");
        }
    }
}
