package com.shopkart.service;

import com.shopkart.dto.CouponApplyRequest;
import com.shopkart.dto.CouponRequest;
import com.shopkart.dto.CouponResponse;
import com.shopkart.entity.Coupon;
import com.shopkart.entity.CouponType;
import com.shopkart.repository.CouponRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Transactional
    public Coupon createCoupon(CouponRequest request) {

        String code = request.getCode().trim().toUpperCase(Locale.ROOT);

        if (couponRepository.existsByCodeIgnoreCase(code)) {
            throw new RuntimeException("Coupon code already exists");
        }

        if (request.getType() == CouponType.PERCENTAGE
                && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new RuntimeException("Percentage discount cannot exceed 100");
        }

        Coupon coupon = new Coupon();
        coupon.setCode(code);
        coupon.setType(request.getType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinimumOrderAmount(request.getMinimumOrderAmount());
        coupon.setMaximumDiscount(request.getMaximumDiscount());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setActive(true);

        return couponRepository.save(coupon);
    }

    @Transactional(readOnly = true)
    public CouponResponse applyCoupon(CouponApplyRequest request) {

        String code = request.getCode().trim();

        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new RuntimeException("Invalid coupon code"));

        if (!coupon.isActive()) {
            throw new RuntimeException("Coupon is inactive");
        }

        if (!coupon.getExpiryDate().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Coupon has expired");
        }

        BigDecimal cartAmount = request.getCartAmount();

        if (cartAmount.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw new RuntimeException(
                    "Minimum order amount is " + coupon.getMinimumOrderAmount()
            );
        }

        BigDecimal discount;

        if (coupon.getType() == CouponType.PERCENTAGE) {
            discount = cartAmount
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (coupon.getMaximumDiscount() != null) {
                discount = discount.min(coupon.getMaximumDiscount());
            }
        } else {
            discount = coupon.getDiscountValue().min(cartAmount);
        }

        discount = discount.setScale(2, RoundingMode.HALF_UP);

        BigDecimal finalAmount = cartAmount.subtract(discount)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        return new CouponResponse(
                coupon.getCode(),
                cartAmount,
                discount,
                finalAmount,
                "Coupon applied successfully"
        );
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Transactional
    public Coupon updateCouponStatus(Long id, boolean active) {

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        coupon.setActive(active);
        return couponRepository.save(coupon);
    }
}