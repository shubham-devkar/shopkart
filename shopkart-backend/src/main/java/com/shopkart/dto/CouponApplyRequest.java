package com.shopkart.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class CouponApplyRequest {

    @NotBlank
    private String code;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal cartAmount;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public BigDecimal getCartAmount() { return cartAmount; }
    public void setCartAmount(BigDecimal cartAmount) {
        this.cartAmount = cartAmount;
    }
}