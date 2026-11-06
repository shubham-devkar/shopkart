package com.shopkart.service;

import com.shopkart.auth.AppUser;
import com.shopkart.auth.UserRepository;
import com.shopkart.dto.ProductReviewRequest;
import com.shopkart.entity.OrderItem;
import com.shopkart.entity.ProductReview;
import com.shopkart.entity.ShopOrder;
import com.shopkart.repository.ProductReviewRepository;
import com.shopkart.repository.ShopOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class ProductReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ShopOrderRepository orderRepository;
    private final UserRepository userRepository;

    public ProductReviewService(
            ProductReviewRepository reviewRepository,
            ShopOrderRepository orderRepository,
            UserRepository userRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    public List<ProductReview> getReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(
                productId
        );
    }

    @Transactional
    public ProductReview addReview(
            Long productId,
            String authenticatedEmail,
            ProductReviewRequest request
    ) {
        String email = authenticatedEmail
                .trim()
                .toLowerCase(Locale.ROOT);

        if (request.rating() == null
                || request.rating() < 1
                || request.rating() > 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rating must be between 1 and 5."
            );
        }

        if (request.comment() == null
                || request.comment().isBlank()
                || request.comment().trim().length() > 1000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Review comment is required and must be under 1000 characters."
            );
        }

        boolean purchased = orderRepository
                .findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(email)
                .stream()
                .filter(order -> order.getStatus() != null)
                .filter(order -> !List.of(
                        "CANCELLED", "CANCELED", "FAILED", "REJECTED"
                ).contains(order.getStatus().toUpperCase(Locale.ROOT)))
                .flatMap(order -> order.getItems().stream())
                .anyMatch(item ->
                        item.getProductId() != null
                                && item.getProductId().equals(productId)
                );

        if (!purchased) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can review only products you have ordered."
            );
        }

        if (reviewRepository.existsByProductIdAndUserEmailIgnoreCase(
                productId, email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already reviewed this product."
            );
        }

        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User account not found."
                ));

        ProductReview review = new ProductReview();
        review.setProductId(productId);
        review.setUserEmail(email);
        review.setUserName(user.getName());
        review.setRating(request.rating());
        review.setComment(request.comment().trim());

        return reviewRepository.save(review);
    }

    public void deleteReview(Long reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Review not found."
                ));

        reviewRepository.delete(review);
    }
}