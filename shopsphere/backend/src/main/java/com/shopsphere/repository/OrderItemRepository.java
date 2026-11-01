package com.shopsphere.repository;

import com.shopsphere.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.productName, SUM(oi.quantity), SUM(oi.totalPrice) " +
           "FROM OrderItem oi GROUP BY oi.productName ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingProducts();
}
