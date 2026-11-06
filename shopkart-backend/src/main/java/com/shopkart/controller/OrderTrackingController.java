package com.shopkart.controller;

import com.shopkart.entity.OrderTracking;
import com.shopkart.service.OrderTrackingService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderTrackingController {

    private final OrderTrackingService trackingService;

    public OrderTrackingController(
            OrderTrackingService trackingService) {
        this.trackingService = trackingService;
    }

    // Request body for updating order status
    public record StatusUpdateRequest(
            @NotBlank String status,
            String description
    ) {}

    // Get complete tracking history
    @GetMapping("/{orderId}/tracking")
    public ResponseEntity<List<OrderTracking>> getTrackingHistory(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                trackingService.getTrackingHistory(orderId)
        );
    }

    // Update order status
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderTracking> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody StatusUpdateRequest request) {

        OrderTracking tracking = trackingService.updateOrderStatus(
                orderId,
                request.status(),
                request.description()
        );

        return ResponseEntity.ok(tracking);
    }
}