package com.evchargehub.service;

import com.evchargehub.dto.request.LoginRequest;
import com.evchargehub.dto.request.RegisterRequest;
import com.evchargehub.dto.response.AuthResponse;
import com.evchargehub.dto.response.UserResponse;

/**
 * Service interface for authentication and user account management.
 */
public interface AuthService {

    /**
     * Registers a new user (EV User or Station Provider).
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticates a user with email and password.
     */
    AuthResponse login(LoginRequest request);

    /**
     * Retrieves profile details for a user.
     */
    UserResponse getUserProfile(Long userId);
}

