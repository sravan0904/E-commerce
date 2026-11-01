package com.shopsphere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ApplyCouponRequest {
    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Cart amount is required")
    private BigDecimal amount;

    public ApplyCouponRequest() {}

    public ApplyCouponRequest(String code, BigDecimal amount) {
        this.code = code;
        this.amount = amount;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
