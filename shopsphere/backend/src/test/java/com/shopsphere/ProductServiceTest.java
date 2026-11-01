package com.shopsphere;

import com.shopsphere.dto.ProductDto;
import com.shopsphere.entity.Category;
import com.shopsphere.entity.Product;
import com.shopsphere.repository.CategoryRepository;
import com.shopsphere.repository.InventoryTransactionRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId(1L);
        category.setName("Electronics");
        category.setSlug("electronics");

        product = new Product();
        product.setId(10L);
        product.setName("Wireless Earbuds");
        product.setSlug("wireless-earbuds");
        product.setBrand("Aura");
        product.setSku("EAR-001");
        product.setPrice(BigDecimal.valueOf(4999.00));
        product.setStockQuantity(20);
        product.setCategory(category);
        product.setActive(true);
    }

    @Test
    void testGetProductById_Success() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        ProductDto dto = productService.getProductById(10L);

        assertNotNull(dto);
        assertEquals("Wireless Earbuds", dto.getName());
        assertEquals(BigDecimal.valueOf(4999.00), dto.getPrice());
    }

    @Test
    void testUpdateStock_Success() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        ProductDto updated = productService.updateStock(10L, 5, "RESTOCK", "Added stock");

        assertNotNull(updated);
        assertEquals(25, product.getStockQuantity());
        verify(inventoryTransactionRepository, times(1)).save(any());
    }
}
