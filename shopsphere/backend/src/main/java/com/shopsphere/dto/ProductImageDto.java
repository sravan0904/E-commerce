package com.shopsphere.dto;

public class ProductImageDto {
    private Long id;
    private String imageUrl;
    private String altText;
    private boolean primary;
    private int displayOrder;

    public ProductImageDto() {}

    public ProductImageDto(Long id, String imageUrl, String altText, boolean primary, int displayOrder) {
        this.id = id;
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
