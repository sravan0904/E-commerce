package com.shopsphere.service;

import com.shopsphere.dto.*;
import com.shopsphere.entity.Role;
import com.shopsphere.entity.User;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.RoleRepository;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.security.JwtTokenProvider;
import com.shopsphere.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with email " + request.getEmail() + " already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);

        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_CUSTOMER")));
        user.setRoles(Collections.singleton(customerRole));

        User savedUser = userRepository.save(user);

        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String jwt = tokenProvider.generateTokenFromUser(userPrincipal);

        List<String> roles = savedUser.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return new AuthResponse(jwt, savedUser.getId(), savedUser.getEmail(), savedUser.getFirstName(), savedUser.getLastName(), roles);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new AuthResponse(jwt, userPrincipal.getId(), userPrincipal.getUsername(),
                userPrincipal.getFirstName(), userPrincipal.getLastName(), roles);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email " + request.getEmail()));
        // For development/demo purposes, we log or simulate email sending
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email " + request.getEmail()));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
