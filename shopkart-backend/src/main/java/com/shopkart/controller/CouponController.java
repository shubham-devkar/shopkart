package com.shopkart.controller;

import com.shopkart.dto.CouponApplyRequest;
import com.shopkart.dto.CouponRequest;
import com.shopkart.dto.CouponResponse;
import com.shopkart.entity.Coupon;
import com.shopkart.service.CouponService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "http://localhost:4200")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping
    public ResponseEntity<Coupon> createCoupon(
            @Valid @RequestBody CouponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(couponService.createCoupon(request));
    }

    @PostMapping("/apply")
    public ResponseEntity<CouponResponse> applyCoupon(
            @Valid @RequestBody CouponApplyRequest request) {
        return ResponseEntity.ok(couponService.applyCoupon(request));
    }

    @GetMapping
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Coupon> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        Boolean active = body.get("active");

        if (active == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
                couponService.updateCouponStatus(id, active)
        );
    }
}