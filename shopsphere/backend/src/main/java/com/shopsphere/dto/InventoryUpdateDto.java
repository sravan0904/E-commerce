package com.shopsphere.dto;

import jakarta.validation.constraints.NotNull;

public class InventoryUpdateDto {

    @NotNull(message = "Quantity change is required")
    private Integer quantityChange;

    private String transactionType = "ADJUSTMENT"; // STOCK_IN, ADJUSTMENT
    private String notes;

    public InventoryUpdateDto() {}

    public Integer getQuantityChange() {
        return quantityChange;
    }

    public void setQuantityChange(Integer quantityChange) {
        this.quantityChange = quantityChange;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
