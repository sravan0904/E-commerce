package com.shopsphere.dto;

import java.math.BigDecimal;

public class ApplyCouponResponse {
    private String code;
    private BigDecimal discountAmount;
    private BigDecimal newTotal;
    private String message;

    public ApplyCouponResponse() {}

    public ApplyCouponResponse(String code, BigDecimal discountAmount, BigDecimal newTotal, String message) {
        this.code = code;
        this.discountAmount = discountAmount;
        this.newTotal = newTotal;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getNewTotal() {
        return newTotal;
    }

    public void setNewTotal(BigDecimal newTotal) {
        this.newTotal = newTotal;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
