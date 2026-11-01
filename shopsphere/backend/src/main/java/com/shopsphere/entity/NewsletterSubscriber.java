package com.shopsphere.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "newsletter_subscribers")
public class NewsletterSubscriber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 191)
    private String email;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "subscribed_at", nullable = false, updatable = false)
    private LocalDateTime subscribedAt;

    @PrePersist
    protected void onCreate() {
        subscribedAt = LocalDateTime.now();
    }

    public NewsletterSubscriber() {}

    public NewsletterSubscriber(String email) {
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getSubscribedAt() {
        return subscribedAt;
    }
}
