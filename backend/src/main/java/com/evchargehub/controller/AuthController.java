package com.evchargehub.controller;

import com.evchargehub.dto.request.LoginRequest;
import com.evchargehub.dto.request.RegisterRequest;
import com.evchargehub.dto.response.AuthResponse;
import com.evchargehub.dto.response.UserResponse;
import com.evchargehub.security.SecurityUtils;
import com.evchargehub.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication and user account endpoints.
 * Base URL: /api/auth
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * User registration endpoint.
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * User login endpoint.
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * User profile retrieval by path ID.
     * GET /api/auth/profile/{userId}
     */
    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserResponse> getProfileById(@PathVariable Long userId) {
        UserResponse response = authService.getUserProfile(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * User profile retrieval for current authenticated user or by ID.
     * GET /api/auth/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "userId", required = false) Long paramUserId) {
        Long userId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramUserId);
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be provided via authentication token, 'X-User-Id' header, or 'userId' parameter.");
        }
        UserResponse response = authService.getUserProfile(userId);
        return ResponseEntity.ok(response);
    }
}
