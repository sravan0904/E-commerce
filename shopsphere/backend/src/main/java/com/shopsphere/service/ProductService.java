package com.shopsphere.service;

import com.shopsphere.dto.ProductDto;
import com.shopsphere.dto.ProductImageDto;
import com.shopsphere.entity.Category;
import com.shopsphere.entity.InventoryTransaction;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.ProductImage;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.CategoryRepository;
import com.shopsphere.repository.InventoryTransactionRepository;
import com.shopsphere.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          InventoryTransactionRepository inventoryTransactionRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
    }

    public Page<ProductDto> getProducts(Long categoryId, String brand, BigDecimal minPrice,
                                        BigDecimal maxPrice, BigDecimal minRating, String search,
                                        Pageable pageable) {
        return productRepository.searchProducts(categoryId, brand, minPrice, maxPrice, minRating, search, pageable)
                .map(this::mapToDto);
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDto(product);
    }

    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return mapToDto(product);
    }

    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getNewArrivals() {
        return productRepository.findTop8ByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getTopRatedProducts() {
        return productRepository.findTop8ByActiveTrueOrderByRatingDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getRelatedProducts(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        return productRepository.findByCategoryAndActiveTrueAndIdNot(product.getCategory(), productId).stream()
                .limit(4)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<String> getBrands() {
        return productRepository.findDistinctBrands();
    }

    @Transactional
    public ProductDto createProduct(ProductDto dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        String slug = generateSlug(dto.getName());
        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis() % 10000;
        }

        if (productRepository.existsBySku(dto.getSku())) {
            throw new BadRequestException("A product with SKU " + dto.getSku() + " already exists");
        }

        Product product = new Product();
        product.setName(dto.getName());
        product.setSlug(slug);
        product.setCategory(category);
        product.setBrand(dto.getBrand());
        product.setSku(dto.getSku());
        product.setDescription(dto.getDescription());
        product.setShortDescription(dto.getShortDescription());
        product.setPrice(dto.getPrice());
        product.setDiscountPrice(dto.getDiscountPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setFeatured(dto.isFeatured());
        product.setActive(dto.isActive());
        product.setSpecifications(dto.getSpecifications());

        if (dto.getImages() != null) {
            for (ProductImageDto imgDto : dto.getImages()) {
                ProductImage image = new ProductImage(
                        imgDto.getImageUrl(),
                        imgDto.getAltText(),
                        imgDto.isPrimary(),
                        imgDto.getDisplayOrder()
                );
                product.addImage(image);
            }
        }

        Product saved = productRepository.save(product);

        if (saved.getStockQuantity() > 0) {
            InventoryTransaction it = new InventoryTransaction();
            it.setProduct(saved);
            it.setTransactionType("INITIAL_STOCK");
            it.setQuantity(saved.getStockQuantity());
            it.setPreviousStock(0);
            it.setNewStock(saved.getStockQuantity());
            it.setNotes("Initial stock addition during product creation");
            inventoryTransactionRepository.save(it);
        }

        return mapToDto(saved);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        product.setName(dto.getName());
        product.setCategory(category);
        product.setBrand(dto.getBrand());
        product.setDescription(dto.getDescription());
        product.setShortDescription(dto.getShortDescription());
        product.setPrice(dto.getPrice());
        product.setDiscountPrice(dto.getDiscountPrice());
        product.setFeatured(dto.isFeatured());
        product.setActive(dto.isActive());
        product.setSpecifications(dto.getSpecifications());

        // Update images
        if (dto.getImages() != null) {
            product.getImages().clear();
            for (ProductImageDto imgDto : dto.getImages()) {
                ProductImage image = new ProductImage(
                        imgDto.getImageUrl(),
                        imgDto.getAltText(),
                        imgDto.isPrimary(),
                        imgDto.getDisplayOrder()
                );
                product.addImage(image);
            }
        }

        Product updated = productRepository.save(product);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        productRepository.delete(product);
    }

    @Transactional
    public ProductDto updateStock(Long productId, int quantityChange, String transactionType, String notes) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        int previousStock = product.getStockQuantity();
        int newStock = previousStock + quantityChange;
        if (newStock < 0) {
            throw new BadRequestException("Stock cannot be reduced below zero");
        }

        product.setStockQuantity(newStock);
        Product saved = productRepository.save(product);

        InventoryTransaction it = new InventoryTransaction();
        it.setProduct(saved);
        it.setTransactionType(transactionType != null ? transactionType : "ADJUSTMENT");
        it.setQuantity(quantityChange);
        it.setPreviousStock(previousStock);
        it.setNewStock(newStock);
        it.setNotes(notes);
        inventoryTransactionRepository.save(it);

        return mapToDto(saved);
    }

    public ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setCategoryId(product.getCategory().getId());
        dto.setCategoryName(product.getCategory().getName());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug());
        dto.setBrand(product.getBrand());
        dto.setSku(product.getSku());
        dto.setDescription(product.getDescription());
        dto.setShortDescription(product.getShortDescription());
        dto.setPrice(product.getPrice());
        dto.setDiscountPrice(product.getDiscountPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setRating(product.getRating());
        dto.setReviewCount(product.getReviewCount());
        dto.setFeatured(product.isFeatured());
        dto.setActive(product.isActive());
        dto.setSpecifications(product.getSpecifications());

        if (product.getImages() != null) {
            dto.setImages(product.getImages().stream()
                    .map(img -> new ProductImageDto(img.getId(), img.getImageUrl(), img.getAltText(), img.isPrimary(), img.getDisplayOrder()))
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private String generateSlug(String name) {
        return name.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");
    }
}
