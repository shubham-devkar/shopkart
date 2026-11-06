package com.shopkart.service;

import com.shopkart.dto.AnalyticsDashboardDTO;
import com.shopkart.entity.OrderItem;
import com.shopkart.entity.Product;
import com.shopkart.entity.ShopOrder;
import com.shopkart.repository.ProductRepository;
import com.shopkart.repository.ShopOrderRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final int LOW_STOCK_LIMIT = 5;

    private final ProductRepository productRepository;
    private final ShopOrderRepository shopOrderRepository;

    public AnalyticsService(ProductRepository productRepository,
                            ShopOrderRepository shopOrderRepository) {
        this.productRepository = productRepository;
        this.shopOrderRepository = shopOrderRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsDashboardDTO getDashboard() {

        List<Product> products = productRepository.findAll();
        List<ShopOrder> orders = shopOrderRepository.findAll();

        AnalyticsDashboardDTO dto = new AnalyticsDashboardDTO();

        // Cancelled / Refunded orders are excluded from revenue.
        List<ShopOrder> revenueOrders = orders.stream()
                .filter(order -> !isCancelled(order.getStatus()))
                .toList();

        // Total Revenue
        BigDecimal totalRevenue = revenueOrders.stream()
                .map(ShopOrder::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        dto.setTotalRevenue(totalRevenue);

        // Total Orders
        dto.setTotalOrders(orders.size());

        // Total Products
        dto.setTotalProducts(products.size());

        // Total Customers
        long totalCustomers = orders.stream()
                .map(ShopOrder::getCustomerEmail)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(email -> !email.isEmpty())
                .map(String::toLowerCase)
                .distinct()
                .count();

        dto.setTotalCustomers(totalCustomers);

        // Low Stock Products
        List<Product> lowStock = products.stream()
                .filter(product ->
                        product.getStockQuantity() != null
                                && product.getStockQuantity() <= LOW_STOCK_LIMIT)
                .sorted(Comparator.comparing(Product::getStockQuantity))
                .toList();

        dto.setLowStockCount(lowStock.size());

        // Out of Stock Products
        long outOfStock = products.stream()
                .filter(product ->
                        product.getStockQuantity() != null
                                && product.getStockQuantity() <= 0)
                .count();

        dto.setOutOfStockCount(outOfStock);

        dto.setLowStockProducts(
                lowStock.stream()
                        .limit(10)
                        .map(product -> new AnalyticsDashboardDTO.LowStockProduct(
                                product.getId(),
                                product.getName(),
                                product.getStockQuantity(),
                                product.getCategory()
                        ))
                        .toList()
        );

        // Order Status
        Map<String, Long> statusMap = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getStatus() == null
                                ? "UNKNOWN"
                                : order.getStatus().toUpperCase(),
                        TreeMap::new,
                        Collectors.counting()
                ));

        dto.setOrderStatus(statusMap);

        // Monthly Sales - Last 12 Months
        List<AnalyticsDashboardDTO.MonthlySales> monthlySales =
                new ArrayList<>();

        YearMonth currentMonth = YearMonth.now();

        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = 11; i >= 0; i--) {

            YearMonth month = currentMonth.minusMonths(i);

            List<ShopOrder> monthlyOrders = revenueOrders.stream()
                    .filter(order ->
                            order.getCreatedAt() != null
                                    && YearMonth.from(order.getCreatedAt()).equals(month))
                    .toList();

            BigDecimal monthlyRevenue = monthlyOrders.stream()
                    .map(ShopOrder::getTotalAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            monthlySales.add(
                    new AnalyticsDashboardDTO.MonthlySales(
                            month.format(formatter),
                            monthlyRevenue,
                            monthlyOrders.size()
                    )
            );
        }

        dto.setMonthlySales(monthlySales);

        // Top Selling Products
        Map<String, ProductSales> productSalesMap = new HashMap<>();

        for (ShopOrder order : revenueOrders) {

            if (order.getItems() == null) {
                continue;
            }

            for (OrderItem item : order.getItems()) {

                String key = item.getProductId() == null
                        ? "name:" + item.getProductName()
                        : "id:" + item.getProductId();

                ProductSales sales = productSalesMap.computeIfAbsent(
                        key,
                        k -> new ProductSales(
                                item.getProductId(),
                                item.getProductName()
                        )
                );

                sales.quantity += item.getQuantity() == null
                        ? 0 : item.getQuantity();

                if (item.getSubtotal() != null) {
                    sales.revenue = sales.revenue.add(item.getSubtotal());
                }
            }
        }

        List<AnalyticsDashboardDTO.TopProduct> topProducts =
                productSalesMap.values().stream()
                        .sorted(Comparator.comparingLong(
                                (ProductSales sales) -> sales.quantity
                        ).reversed())
                        .limit(5)
                        .map(sales -> new AnalyticsDashboardDTO.TopProduct(
                                sales.productId,
                                sales.productName,
                                sales.quantity,
                                sales.revenue
                        ))
                        .toList();

        dto.setTopProducts(topProducts);

        // Recent Orders
        List<AnalyticsDashboardDTO.RecentOrder> recentOrders =
                orders.stream()
                        .sorted(Comparator.comparing(
                                ShopOrder::getCreatedAt,
                                Comparator.nullsLast(Comparator.reverseOrder())
                        ))
                        .limit(10)
                        .map(order -> new AnalyticsDashboardDTO.RecentOrder(
                                order.getId(),
                                order.getCustomerName(),
                                order.getCustomerEmail(),
                                order.getTotalAmount(),
                                order.getStatus(),
                                order.getCreatedAt()
                        ))
                        .toList();

        dto.setRecentOrders(recentOrders);

        return dto;
    }

    private boolean isCancelled(String status) {

        if (status == null) {
            return false;
        }

        String value = status.trim().toUpperCase();

        return value.equals("CANCELLED")
                || value.equals("CANCELED")
                || value.equals("REFUNDED");
    }

    // Internal Product Sales Calculation
    private static class ProductSales {

        private Long productId;
        private String productName;
        private long quantity;
        private BigDecimal revenue = BigDecimal.ZERO;

        public ProductSales(Long productId, String productName) {
            this.productId = productId;
            this.productName = productName;
        }
    }
}