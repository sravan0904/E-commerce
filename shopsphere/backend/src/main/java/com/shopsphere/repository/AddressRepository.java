package com.shopsphere.repository;

import com.shopsphere.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserIdOrderByIsDefaultDesc(Long userId);
    List<Address> findByUserId(Long userId);
}
