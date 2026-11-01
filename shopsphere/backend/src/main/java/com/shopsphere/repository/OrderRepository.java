package com.shopsphere.repository;

import com.shopsphere.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Order> findByUserId(Long userId, Pageable pageable);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Order> findByStatus(String status, Pageable pageable);

    long countByStatus(String status);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.status NOT IN ('CANCELLED', 'RETURNED')")
    BigDecimal sumTotalRevenue();

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatusGroup();

    List<Order> findTop10ByOrderByCreatedAtDesc();
}
