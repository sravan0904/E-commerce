package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.ProductDto;
import com.shopsphere.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final com.shopsphere.service.ProductScraperService productScraperService;
    private final com.shopsphere.service.ProductCatalogExpansionService productCatalogExpansionService;

    public ProductController(ProductService productService,
                             com.shopsphere.service.ProductScraperService productScraperService,
                             com.shopsphere.service.ProductCatalogExpansionService productCatalogExpansionService) {
        this.productService = productService;
        this.productScraperService = productScraperService;
        this.productCatalogExpansionService = productCatalogExpansionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "newest") String sort) {

        Sort sortConfig;
        switch (sort.toLowerCase()) {
            case "price-asc":
                sortConfig = Sort.by(Sort.Direction.ASC, "price");
                break;
            case "price-desc":
                sortConfig = Sort.by(Sort.Direction.DESC, "price");
                break;
            case "rating":
                sortConfig = Sort.by(Sort.Direction.DESC, "rating");
                break;
            case "popular":
                sortConfig = Sort.by(Sort.Direction.DESC, "reviewCount");
                break;
            case "newest":
            default:
                sortConfig = Sort.by(Sort.Direction.DESC, "createdAt");
                break;
        }

        if (search != null && !search.trim().isBlank()) {
            try {
                productScraperService.searchAndImportGlobal(search.trim());
            } catch (Exception ignored) {}
        }

        Pageable pageable = PageRequest.of(page, size, sortConfig);
        Page<ProductDto> products = productService.getProducts(categoryId, brand, minPrice, maxPrice, minRating, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Products fetched successfully", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable Long id) {
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.ok("Product fetched successfully", product));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductBySlug(@PathVariable String slug) {
        ProductDto product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok("Product fetched successfully", product));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getFeaturedProducts() {
        List<ProductDto> featured = productService.getFeaturedProducts();
        return ResponseEntity.ok(ApiResponse.ok("Featured products fetched successfully", featured));
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getNewArrivals() {
        List<ProductDto> newArrivals = productService.getNewArrivals();
        return ResponseEntity.ok(ApiResponse.ok("New arrivals fetched successfully", newArrivals));
    }

    @GetMapping("/top-rated")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getTopRatedProducts() {
        List<ProductDto> topRated = productService.getTopRatedProducts();
        return ResponseEntity.ok(ApiResponse.ok("Top rated products fetched successfully", topRated));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getRelatedProducts(@PathVariable Long id) {
        List<ProductDto> related = productService.getRelatedProducts(id);
        return ResponseEntity.ok(ApiResponse.ok("Related products fetched successfully", related));
    }

    @GetMapping("/brands")
    public ResponseEntity<ApiResponse<List<String>>> getBrands() {
        List<String> brands = productService.getBrands();
        return ResponseEntity.ok(ApiResponse.ok("Brands fetched successfully", brands));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductDto dto) {
        ProductDto created = productService.createProduct(dto);
        return ResponseEntity.ok(ApiResponse.ok("Product created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDto dto) {
        ProductDto updated = productService.updateProduct(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Product updated successfully", updated));
    }

    @PostMapping("/scrape-feed")
    public ResponseEntity<ApiResponse<List<ProductDto>>> scrapeFeed(@RequestParam(defaultValue = "30") int limit) {
        List<ProductDto> imported = productScraperService.scrapeAndImportOnlineCatalog(limit);
        return ResponseEntity.ok(ApiResponse.ok("Imported " + imported.size() + " online products successfully", imported));
    }

    @PostMapping("/import-all-world")
    public ResponseEntity<ApiResponse<List<ProductDto>>> importAllWorld() {
        List<ProductDto> imported = productScraperService.scrapeAndImportOnlineCatalog(250);
        return ResponseEntity.ok(ApiResponse.ok("Imported " + imported.size() + " products from all categories worldwide", imported));
    }

    @PostMapping("/scrape-url")
    public ResponseEntity<ApiResponse<ProductDto>> scrapeFromUrl(@RequestBody java.util.Map<String, String> payload) {
        String url = payload.get("url");
        ProductDto scraped = productScraperService.scrapeFromUrl(url);
        return ResponseEntity.ok(ApiResponse.ok("Product scraped and imported successfully", scraped));
    }

    @PostMapping("/seed-branded-catalog")
    public ResponseEntity<ApiResponse<String>> seedBrandedCatalog() {
        int added = productCatalogExpansionService.seedGlobalBrandProducts();
        return ResponseEntity.ok(ApiResponse.ok("Seeded " + added + " top branded smartphones, laptops and fashion items successfully", "Added: " + added));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok("Product deleted successfully"));
    }
}
