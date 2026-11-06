package com.shopkart.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record PlaceOrderRequest(

        @NotBlank(message = "Customer name is required")
        String customerName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email")
        String customerEmail,

        String customerPhone,

        String shippingAddress,

        String city,

        String state,

        String pincode,

        String paymentMethod,

        @NotEmpty(message = "Order must contain at least one item")
        List<@Valid OrderItemRequest> items,

        String couponCode

) {
}