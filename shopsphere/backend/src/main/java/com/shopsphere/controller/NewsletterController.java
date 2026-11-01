package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.entity.NewsletterSubscriber;
import com.shopsphere.repository.NewsletterSubscriberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private final NewsletterSubscriberRepository subscriberRepository;

    public NewsletterController(NewsletterSubscriberRepository subscriberRepository) {
        this.subscriberRepository = subscriberRepository;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<String>> subscribe(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank() || !email.contains("@")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Please provide a valid email address"));
        }

        if (subscriberRepository.existsByEmail(email.toLowerCase().trim())) {
            return ResponseEntity.ok(ApiResponse.ok("You are already subscribed to our newsletter!"));
        }

        NewsletterSubscriber subscriber = new NewsletterSubscriber(email.toLowerCase().trim());
        subscriberRepository.save(subscriber);
        return ResponseEntity.ok(ApiResponse.ok("Thank you for subscribing! Check your inbox for exclusive perks."));
    }
}
