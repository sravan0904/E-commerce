package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.CreateReviewRequest;
import com.shopsphere.dto.ReviewDto;
import com.shopsphere.security.UserPrincipal;
import com.shopsphere.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getProductReviews(@PathVariable Long productId) {
        List<ReviewDto> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(ApiResponse.ok("Reviews fetched successfully", reviews));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewDto review = reviewService.createReview(userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Review submitted successfully", review));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ReviewDto>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<ReviewDto> reviews = reviewService.getAllReviews(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok("Reviews fetched", reviews));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.ok("Review deleted successfully"));
    }
}
