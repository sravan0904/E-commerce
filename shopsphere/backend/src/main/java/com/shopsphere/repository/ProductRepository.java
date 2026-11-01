package com.shopsphere.repository;

import com.shopsphere.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);
    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);
    boolean existsBySlug(String slug);

    List<Product> findByFeaturedTrueAndActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.active = true " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:brand IS NULL OR LOWER(p.brand) = LOWER(:brand)) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
           "AND (:minRating IS NULL OR p.rating >= :minRating) " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchProducts(
        @Param("categoryId") Long categoryId,
        @Param("brand") String brand,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("minRating") BigDecimal minRating,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.active = true ORDER BY p.brand ASC")
    List<String> findDistinctBrands();

    List<Product> findTop8ByActiveTrueOrderByCreatedAtDesc();

    List<Product> findTop8ByActiveTrueOrderByRatingDesc();

    List<Product> findByCategoryAndActiveTrueAndIdNot(com.shopsphere.entity.Category category, Long id);

    @Query("SELECT p FROM Product p WHERE p.stockQuantity <= :threshold")
    List<Product> findLowStockProducts(@Param("threshold") int threshold);
}
