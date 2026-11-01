package com.shopsphere.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupon_usage")
public class CouponUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt;

    @PrePersist
    protected void onCreate() {
        usedAt = LocalDateTime.now();
    }

    public CouponUsage() {}

    public CouponUsage(Coupon coupon, User user, Long orderId) {
        this.coupon = coupon;
        this.user = user;
        this.orderId = orderId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Coupon getCoupon() {
        return coupon;
    }

    public void setCoupon(Coupon coupon) {
        this.coupon = coupon;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }
}
