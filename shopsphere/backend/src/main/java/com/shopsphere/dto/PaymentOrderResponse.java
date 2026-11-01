package com.shopsphere.dto;

import java.math.BigDecimal;

public class PaymentOrderResponse {
    private String razorpayOrderId;
    private String currency;
    private BigDecimal amount;
    private String keyId;
    private String orderNumber;

    public PaymentOrderResponse() {}

    public PaymentOrderResponse(String razorpayOrderId, String currency, BigDecimal amount, String keyId, String orderNumber) {
        this.razorpayOrderId = razorpayOrderId;
        this.currency = currency;
        this.amount = amount;
        this.keyId = keyId;
        this.orderNumber = orderNumber;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
}
