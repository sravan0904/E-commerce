package com.shopsphere.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private long totalOrders = 0;
    private long totalCustomers = 0;
    private long totalProducts = 0;
    private long pendingOrders = 0;
    private long lowStockCount = 0;

    private List<OrderDto> recentOrders;
    private List<ProductDto> lowStockProducts;
    private Map<String, Long> ordersByStatus;
    private List<MonthlySalesData> monthlySales;
    private List<TopProductData> topSellingProducts;

    public DashboardStatsDto() {}

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public List<OrderDto> getRecentOrders() {
        return recentOrders;
    }

    public void setRecentOrders(List<OrderDto> recentOrders) {
        this.recentOrders = recentOrders;
    }

    public List<ProductDto> getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(List<ProductDto> lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    public Map<String, Long> getOrdersByStatus() {
        return ordersByStatus;
    }

    public void setOrdersByStatus(Map<String, Long> ordersByStatus) {
        this.ordersByStatus = ordersByStatus;
    }

    public List<MonthlySalesData> getMonthlySales() {
        return monthlySales;
    }

    public void setMonthlySales(List<MonthlySalesData> monthlySales) {
        this.monthlySales = monthlySales;
    }

    public List<TopProductData> getTopSellingProducts() {
        return topSellingProducts;
    }

    public void setTopSellingProducts(List<TopProductData> topSellingProducts) {
        this.topSellingProducts = topSellingProducts;
    }

    public static class MonthlySalesData {
        private String month;
        private BigDecimal revenue;
        private long orders;

        public MonthlySalesData(String month, BigDecimal revenue, long orders) {
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

    public static class TopProductData {
        private String name;
        private long quantity;
        private BigDecimal totalAmount;

        public TopProductData(String name, long quantity, BigDecimal totalAmount) {
            this.name = name;
            this.quantity = quantity;
            this.totalAmount = totalAmount;
        }

        public String getName() {
            return name;
        }

        public long getQuantity() {
            return quantity;
        }

        public BigDecimal getTotalAmount() {
            return totalAmount;
        }
    }
}
