package com.shopkart.controller;

import com.shopkart.dto.ProductReviewRequest;
import com.shopkart.entity.ProductReview;
import com.shopkart.service.ProductReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:4200")
public class ProductReviewController {

    private final ProductReviewService reviewService;

    public ProductReviewController(
            ProductReviewService reviewService
    ) {
        this.reviewService = reviewService;
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductReview>> getReviews(
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(
                reviewService.getReviews(productId)
        );
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<ProductReview> addReview(
            @PathVariable Long productId,
            @Valid @RequestBody ProductReviewRequest request,
            Authentication authentication
    ) {
        ProductReview review = reviewService.addReview(
                productId,
                authentication.getName(),
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(review);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Map<String, String>> deleteReview(
            @PathVariable Long reviewId
    ) {
        reviewService.deleteReview(reviewId);

        return ResponseEntity.ok(
                Map.of("message", "Review deleted successfully.")
        );
    }
}