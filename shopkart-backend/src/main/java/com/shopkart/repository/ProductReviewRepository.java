package com.shopkart.repository;

import com.shopkart.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductReviewRepository
        extends JpaRepository<ProductReview, Long> {

    List<ProductReview> findByProductIdOrderByCreatedAtDesc(
            Long productId
    );

    boolean existsByProductIdAndUserEmailIgnoreCase(
            Long productId,
            String userEmail
    );

    void deleteByIdAndProductId(Long id, Long productId);
}