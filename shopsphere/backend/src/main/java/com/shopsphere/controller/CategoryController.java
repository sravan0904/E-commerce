package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.CategoryDto;
import com.shopsphere.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        List<CategoryDto> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(ApiResponse.ok("Categories fetched successfully", categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable Long id) {
        CategoryDto category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.ok("Category fetched successfully", category));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryBySlug(@PathVariable String slug) {
        CategoryDto category = categoryService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok("Category fetched successfully", category));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryDto dto) {
        CategoryDto created = categoryService.createCategory(dto);
        return ResponseEntity.ok(ApiResponse.ok("Category created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDto dto) {
        CategoryDto updated = categoryService.updateCategory(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Category updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted successfully"));
    }
}
