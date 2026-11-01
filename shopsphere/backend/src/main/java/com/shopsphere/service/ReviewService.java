package com.shopsphere.service;

import com.shopsphere.dto.CreateReviewRequest;
import com.shopsphere.dto.ReviewDto;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.ProductReview;
import com.shopsphere.entity.User;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.ProductReviewRepository;
import com.shopsphere.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ProductReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<ReviewDto> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, "APPROVED").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto createReview(Long userId, CreateReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        ProductReview review = new ProductReview();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        review.setVerifiedPurchase(true);
        review.setStatus("APPROVED");

        ProductReview saved = reviewRepository.save(review);

        // Update product average rating & review count
        Double avg = reviewRepository.calculateAverageRating(product.getId());
        Integer count = reviewRepository.countApprovedReviews(product.getId());
        if (avg != null) {
            product.setRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        }
        if (count != null) {
            product.setReviewCount(count);
        }
        productRepository.save(product);

        return mapToDto(saved);
    }

    public Page<ReviewDto> getAllReviews(Pageable pageable) {
        return reviewRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToDto);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        Product p = review.getProduct();
        reviewRepository.delete(review);

        // Recalculate
        Double avg = reviewRepository.calculateAverageRating(p.getId());
        Integer count = reviewRepository.countApprovedReviews(p.getId());
        p.setRating(avg != null ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        p.setReviewCount(count != null ? count : 0);
        productRepository.save(p);
    }

    private ReviewDto mapToDto(ProductReview review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setProductId(review.getProduct().getId());
        dto.setProductName(review.getProduct().getName());
        dto.setUserId(review.getUser().getId());
        dto.setUserName(review.getUser().getFirstName() + " " + review.getUser().getLastName());
        dto.setUserAvatar(review.getUser().getAvatarUrl());
        dto.setRating(review.getRating());
        dto.setTitle(review.getTitle());
        dto.setComment(review.getComment());
        dto.setVerifiedPurchase(review.isVerifiedPurchase());
        dto.setStatus(review.getStatus());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
