package com.shopsphere.service;

import com.shopsphere.dto.ApplyCouponResponse;
import com.shopsphere.dto.CouponDto;
import com.shopsphere.entity.Coupon;
import com.shopsphere.entity.CouponUsage;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.User;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.CouponRepository;
import com.shopsphere.repository.CouponUsageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    public CouponService(CouponRepository couponRepository, CouponUsageRepository couponUsageRepository) {
        this.couponRepository = couponRepository;
        this.couponUsageRepository = couponUsageRepository;
    }

    public List<CouponDto> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CouponDto getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        return mapToDto(coupon);
    }

    public ApplyCouponResponse validateAndApplyCoupon(String code, BigDecimal amount, Long userId) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new BadRequestException("Invalid coupon code"));

        if (!coupon.isActive()) {
            throw new BadRequestException("This coupon is no longer active");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getValidFrom().isAfter(now)) {
            throw new BadRequestException("This coupon has not started yet");
        }

        if (coupon.getValidUntil().isBefore(now)) {
            throw new BadRequestException("This coupon has expired");
        }

        if (coupon.getUsageCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit has been reached");
        }

        if (coupon.getMinOrderAmount() != null && amount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Minimum order amount of ₹" + coupon.getMinOrderAmount() + " required to use this coupon");
        }

        if (userId != null) {
            long usedByUser = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), userId);
            if (usedByUser > 0) {
                throw new BadRequestException("You have already used this coupon");
            }
        }

        BigDecimal discount;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = amount.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        if (discount.compareTo(amount) > 0) {
            discount = amount;
        }

        BigDecimal newTotal = amount.subtract(discount);
        return new ApplyCouponResponse(coupon.getCode(), discount, newTotal, "Coupon applied successfully! You saved ₹" + discount);
    }

    @Transactional
    public CouponDto createCoupon(CouponDto dto) {
        if (couponRepository.existsByCodeIgnoreCase(dto.getCode())) {
            throw new BadRequestException("Coupon code already exists");
        }

        Coupon coupon = new Coupon();
        coupon.setCode(dto.getCode().toUpperCase().trim());
        coupon.setDescription(dto.getDescription());
        coupon.setDiscountType(dto.getDiscountType().toUpperCase());
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setMinOrderAmount(dto.getMinOrderAmount() != null ? dto.getMinOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        coupon.setUsageLimit(dto.getUsageLimit() > 0 ? dto.getUsageLimit() : 100);
        coupon.setValidFrom(dto.getValidFrom() != null ? dto.getValidFrom() : LocalDateTime.now());
        coupon.setValidUntil(dto.getValidUntil() != null ? dto.getValidUntil() : LocalDateTime.now().plusMonths(1));
        coupon.setActive(dto.isActive());

        Coupon saved = couponRepository.save(coupon);
        return mapToDto(saved);
    }

    @Transactional
    public CouponDto updateCoupon(Long id, CouponDto dto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));

        coupon.setDescription(dto.getDescription());
        coupon.setDiscountType(dto.getDiscountType().toUpperCase());
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setMinOrderAmount(dto.getMinOrderAmount());
        coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        coupon.setUsageLimit(dto.getUsageLimit());
        if (dto.getValidFrom() != null) coupon.setValidFrom(dto.getValidFrom());
        if (dto.getValidUntil() != null) coupon.setValidUntil(dto.getValidUntil());
        coupon.setActive(dto.isActive());

        Coupon updated = couponRepository.save(coupon);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        couponRepository.delete(coupon);
    }

    @Transactional
    public void recordUsage(String couponCode, User user, Order order) {
        couponRepository.findByCodeIgnoreCase(couponCode).ifPresent(coupon -> {
            coupon.setUsageCount(coupon.getUsageCount() + 1);
            couponRepository.save(coupon);

            CouponUsage usage = new CouponUsage(coupon, user, order.getId());
            couponUsageRepository.save(usage);
        });
    }

    private CouponDto mapToDto(Coupon coupon) {
        CouponDto dto = new CouponDto();
        dto.setId(coupon.getId());
        dto.setCode(coupon.getCode());
        dto.setDescription(coupon.getDescription());
        dto.setDiscountType(coupon.getDiscountType());
        dto.setDiscountValue(coupon.getDiscountValue());
        dto.setMinOrderAmount(coupon.getMinOrderAmount());
        dto.setMaxDiscountAmount(coupon.getMaxDiscountAmount());
        dto.setUsageLimit(coupon.getUsageLimit());
        dto.setUsageCount(coupon.getUsageCount());
        dto.setValidFrom(coupon.getValidFrom());
        dto.setValidUntil(coupon.getValidUntil());
        dto.setActive(coupon.isActive());
        return dto;
    }
}
