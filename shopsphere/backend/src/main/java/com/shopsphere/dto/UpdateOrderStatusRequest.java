package com.shopsphere.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateOrderStatusRequest {

    @NotBlank(message = "Order status is required")
    private String status;

    private String trackingNumber;
    private String notes;

    public UpdateOrderStatusRequest() {}

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
