
package com.shopkart.service;

import com.shopkart.dto.CouponApplyRequest;
import com.shopkart.dto.CouponResponse;
import com.shopkart.dto.OrderItemRequest;
import com.shopkart.dto.PlaceOrderRequest;

import com.shopkart.entity.OrderItem;
import com.shopkart.entity.Product;
import com.shopkart.entity.ShopOrder;

import com.shopkart.repository.ProductRepository;
import com.shopkart.repository.ShopOrderRepository;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;

@Service
public class OrderService {

    private final ProductRepository productRepository;
    private final ShopOrderRepository orderRepository;
    private final EmailService emailService;
    private final CouponService couponService;

    public OrderService(
            ProductRepository productRepository,
            ShopOrderRepository orderRepository,
            EmailService emailService,
            CouponService couponService) {

        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.emailService = emailService;
        this.couponService = couponService;
    }

    @Transactional
    public ShopOrder placeOrder(PlaceOrderRequest request) {

        if (request == null ||
                request.customerName() == null ||
                request.customerName().isBlank() ||
                request.customerEmail() == null ||
                request.customerEmail().isBlank() ||
                request.items() == null ||
                request.items().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid order details are required"
            );
        }

        ShopOrder order = new ShopOrder();

        order.setCustomerName(request.customerName().trim());

        order.setCustomerEmail(
                request.customerEmail().trim().toLowerCase(Locale.ROOT)
        );

        order.setPaymentMethod(
                request.paymentMethod() != null &&
                        !request.paymentMethod().isBlank()
                        ? request.paymentMethod()
                        : "COD"
        );

        order.setStatus("PLACED");

        BigDecimal subtotal = BigDecimal.ZERO;

        // Validate products and calculate subtotal.
        for (OrderItemRequest requested : request.items()) {

            if (requested == null ||
                    requested.productId() == null ||
                    requested.quantity() == null ||
                    requested.quantity() < 1) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Valid product ID and quantity are required"
                );
            }

            Product product = productRepository
                    .findById(requested.productId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Product not found: " + requested.productId()
                    ));

            if (!Boolean.TRUE.equals(product.getActive())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        product.getName() + " is not available"
                );
            }

            int quantity = requested.quantity();

            if (product.getStockQuantity() == null ||
                    product.getStockQuantity() < quantity) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for " + product.getName()
                );
            }

            if (product.getPrice() == null ||
                    product.getPrice().compareTo(BigDecimal.ZERO) < 0) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid price for " + product.getName()
                );
            }

            BigDecimal unitPrice = product.getPrice();

            BigDecimal itemSubtotal = unitPrice
                    .multiply(BigDecimal.valueOf(quantity))
                    .setScale(2, RoundingMode.HALF_UP);

            OrderItem item = new OrderItem();

            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setQuantity(quantity);
            item.setUnitPrice(unitPrice);
            item.setSubtotal(itemSubtotal);

            order.addItem(item);

            subtotal = subtotal.add(itemSubtotal);

            product.setStockQuantity(
                    product.getStockQuantity() - quantity
            );

            productRepository.save(product);
        }

        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);

        // Apply coupon using backend calculation.
        BigDecimal finalAmount = subtotal;

        String couponCode = request.couponCode();

        if (couponCode != null && !couponCode.isBlank()) {

            try {

                CouponApplyRequest couponRequest =
                        new CouponApplyRequest();

                couponRequest.setCode(couponCode.trim());
                couponRequest.setCartAmount(subtotal);

                CouponResponse couponResponse =
                        couponService.applyCoupon(couponRequest);

                finalAmount = couponResponse.getFinalAmount();

            } catch (ResponseStatusException ex) {

                throw ex;

            } catch (RuntimeException ex) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        ex.getMessage() != null
                                ? ex.getMessage()
                                : "Invalid coupon"
                );
            }
        }

        // Save final discounted amount.
        order.setTotalAmount(
                finalAmount.setScale(2, RoundingMode.HALF_UP)
        );

        // Save order.
        ShopOrder savedOrder = orderRepository.save(order);

        // Send confirmation email.
        try {

            emailService.sendOrderConfirmation(savedOrder);

        } catch (Exception e) {

            System.err.println(
                    "Order saved, but confirmation email failed: "
                            + e.getMessage()
            );
        }

        return savedOrder;
    }

    // Get orders for a particular customer.
    public List<ShopOrder> getOrdersByEmail(String email) {

        if (email == null || email.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required"
            );
        }

        return orderRepository
                .findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(
                        email.trim()
                );
    }

    // Get all customer orders for Admin Orders page.
    public List<ShopOrder> getAllOrders() {

        return orderRepository.findAllByOrderByCreatedAtDesc();
    }
}
