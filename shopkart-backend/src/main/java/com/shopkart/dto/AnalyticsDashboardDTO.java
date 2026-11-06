package com.shopkart.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AnalyticsDashboardDTO {

    private long totalOrders;
    private long totalProducts;
    private long totalCustomers;

    private BigDecimal totalRevenue;

    private long lowStockCount;
    private long outOfStockCount;

    private List<MonthlySales> monthlySales;
    private Map<String, Long> orderStatus;

    private List<TopProduct> topProducts;
    private List<RecentOrder> recentOrders;
    private List<LowStockProduct> lowStockProducts;

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public long getOutOfStockCount() {
        return outOfStockCount;
    }

    public void setOutOfStockCount(long outOfStockCount) {
        this.outOfStockCount = outOfStockCount;
    }

    public List<MonthlySales> getMonthlySales() {
        return monthlySales;
    }

    public void setMonthlySales(List<MonthlySales> monthlySales) {
        this.monthlySales = monthlySales;
    }

    public Map<String, Long> getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(Map<String, Long> orderStatus) {
        this.orderStatus = orderStatus;
    }

    public List<TopProduct> getTopProducts() {
        return topProducts;
    }

    public void setTopProducts(List<TopProduct> topProducts) {
        this.topProducts = topProducts;
    }

    public List<RecentOrder> getRecentOrders() {
        return recentOrders;
    }

    public void setRecentOrders(List<RecentOrder> recentOrders) {
        this.recentOrders = recentOrders;
    }

    public List<LowStockProduct> getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(List<LowStockProduct> lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    // Monthly Sales DTO
    public static class MonthlySales {

        private String month;
        private BigDecimal revenue;
        private long orders;

        public MonthlySales(String month, BigDecimal revenue, long orders) {
            this.month = month;
            this.revenue = revenue;
            this.orders = orders;
        }

        public String getMonth() {
            return month;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public long getOrders() {
            return orders;
        }
    }

    // Top Selling Product DTO
    public static class TopProduct {

        private Long productId;
        private String productName;
        private long quantitySold;
        private BigDecimal revenue;

        public TopProduct(Long productId, String productName,
                          long quantitySold, BigDecimal revenue) {
            this.productId = productId;
            this.productName = productName;
            this.quantitySold = quantitySold;
            this.revenue = revenue;
        }

        public Long getProductId() {
            return productId;
        }

        public String getProductName() {
            return productName;
        }

        public long getQuantitySold() {
            return quantitySold;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }
    }

    // Recent Order DTO
    public static class RecentOrder {

        private Long id;
        private String customerName;
        private String customerEmail;
        private BigDecimal totalAmount;
        private String status;
        private LocalDateTime createdAt;

        public RecentOrder(Long id, String customerName,
                           String customerEmail, BigDecimal totalAmount,
                           String status, LocalDateTime createdAt) {
            this.id = id;
            this.customerName = customerName;
            this.customerEmail = customerEmail;
            this.totalAmount = totalAmount;
            this.status = status;
            this.createdAt = createdAt;
        }

        public Long getId() {
            return id;
        }

        public String getCustomerName() {
            return customerName;
        }

        public String getCustomerEmail() {
            return customerEmail;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public String getStatus() {
            return status;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }
    }

    // Low Stock Product DTO
    public static class LowStockProduct {

        private Long id;
        private String name;
        private Integer stockQuantity;
        private String category;

        public LowStockProduct(Long id, String name,
                               Integer stockQuantity, String category) {
            this.id = id;
            this.name = name;
            this.stockQuantity = stockQuantity;
            this.category = category;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public Integer getStockQuantity() {
            return stockQuantity;
        }

        public String getCategory() {
            return category;
        }
    }
}