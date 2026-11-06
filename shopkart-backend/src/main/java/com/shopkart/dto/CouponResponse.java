package com.shopkart.dto;

import java.math.BigDecimal;

public class CouponResponse {

    private String code;
    private BigDecimal cartAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String message;

    public CouponResponse() {
    }

    public CouponResponse(String code, BigDecimal cartAmount,
                          BigDecimal discountAmount,
                          BigDecimal finalAmount, String message) {
        this.code = code;
        this.cartAmount = cartAmount;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
        this.message = message;
    }

    public String getCode() { return code; }
    public BigDecimal getCartAmount() { return cartAmount; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public BigDecimal getFinalAmount() { return finalAmount; }
    public String getMessage() { return message; }
}