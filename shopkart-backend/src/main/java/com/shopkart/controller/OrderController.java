
package com.shopkart.controller;

import com.shopkart.dto.PlaceOrderRequest;
import com.shopkart.entity.ShopOrder;
import com.shopkart.service.OrderService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Place new order
    @PostMapping
    public ResponseEntity<ShopOrder> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request) {

        ShopOrder order = orderService.placeOrder(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(order);
    }

    // Get customer orders
    @GetMapping
    public ResponseEntity<List<ShopOrder>> getOrders(
            @RequestParam String email) {

        return ResponseEntity.ok(
                orderService.getOrdersByEmail(email)
        );
    }

    // Get all orders for Admin
    @GetMapping("/admin/all")
    public ResponseEntity<List<ShopOrder>> getAllOrders() {

        return ResponseEntity.ok(
                orderService.getAllOrders()
        );
    }
}
