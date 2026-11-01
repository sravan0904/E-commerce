package com.shopsphere.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "product_images")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "alt_text", length = 200)
    private String altText;

    @Column(name = "is_primary", nullable = false)
    private boolean primary = false;

    @Column(name = "display_order")
    private int displayOrder = 0;

    public ProductImage() {}

    public ProductImage(String imageUrl, String altText, boolean primary, int displayOrder) {
        this.imageUrl = imageUrl;
        this.altText = altText;
        this.primary = primary;
        this.displayOrder = displayOrder;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAltText() {
        return altText;
    }

    public void setAltText(String altText) {
        this.altText = altText;
    }

    public boolean isPrimary() {
        return primary;
    }

    public void setPrimary(boolean primary) {
        this.primary = primary;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }
}
