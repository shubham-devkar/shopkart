package com.shopkart.service;

import com.shopkart.entity.OrderTracking;
import com.shopkart.entity.ShopOrder;
import com.shopkart.repository.OrderTrackingRepository;
import com.shopkart.repository.ShopOrderRepository;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@Service
public class OrderTrackingService {

    private final OrderTrackingRepository trackingRepository;
    private final ShopOrderRepository orderRepository;

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "PLACED",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED"
    );

    public OrderTrackingService(
            OrderTrackingRepository trackingRepository,
            ShopOrderRepository orderRepository) {

        this.trackingRepository = trackingRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public OrderTracking updateOrderStatus(
            Long orderId,
            String status,
            String description) {

        if (orderId == null || status == null || status.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order ID and status are required"
            );
        }

        String newStatus = status.trim().toUpperCase();

        if (!ALLOWED_STATUSES.contains(newStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid order status"
            );
        }

        ShopOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found"
                ));

        if ("DELIVERED".equals(order.getStatus()) ||
                "CANCELLED".equals(order.getStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This order can no longer be updated"
            );
        }

        order.setStatus(newStatus);
        orderRepository.save(order);

        OrderTracking tracking = new OrderTracking();
        tracking.setOrder(order);
        tracking.setStatus(newStatus);
        tracking.setDescription(
                description != null && !description.isBlank()
                        ? description.trim()
                        : "Order status updated to " + newStatus
        );

        return trackingRepository.save(tracking);
    }

    public List<OrderTracking> getTrackingHistory(Long orderId) {

        if (orderId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order ID is required"
            );
        }

        if (!orderRepository.existsById(orderId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Order not found"
            );
        }

        return trackingRepository
                .findByOrderIdOrderByUpdatedAtAsc(orderId);
    }
}