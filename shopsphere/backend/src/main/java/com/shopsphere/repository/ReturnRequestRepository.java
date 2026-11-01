package com.shopsphere.repository;

import com.shopsphere.entity.ReturnRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    List<ReturnRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<ReturnRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
    boolean existsByOrderId(Long orderId);
}
