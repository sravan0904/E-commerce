package com.shopsphere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateOrderRequest {

    @NotNull(message = "Shipping address is required")
    private Long shippingAddressId;

    private Long billingAddressId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // COD, RAZORPAY

    private String couponCode;
    private String notes;

    public CreateOrderRequest() {}

    public Long getShippingAddressId() {
        return shippingAddressId;
    }

    public void setShippingAddressId(Long shippingAddressId) {
        this.shippingAddressId = shippingAddressId;
    }

    public Long getBillingAddressId() {
        return billingAddressId;
    }

    public void setBillingAddressId(Long billingAddressId) {
        this.billingAddressId = billingAddressId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
