
package com.shopkart.repository;

import com.shopkart.entity.ShopOrder;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {

    @EntityGraph(attributePaths = {"items"})
    List<ShopOrder> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(
            String customerEmail
    );

    @EntityGraph(attributePaths = {"items"})
    List<ShopOrder> findAllByOrderByCreatedAtDesc();
}
