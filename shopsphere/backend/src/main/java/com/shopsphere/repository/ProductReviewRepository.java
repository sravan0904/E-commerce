package com.shopsphere.repository;

import com.shopsphere.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, String status);
    Page<ProductReview> findByProductIdAndStatus(Long productId, String status, Pageable pageable);
    Page<ProductReview> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.id = :productId AND r.status = 'APPROVED'")
    Double calculateAverageRating(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM ProductReview r WHERE r.product.id = :productId AND r.status = 'APPROVED'")
    Integer countApprovedReviews(@Param("productId") Long productId);
}
