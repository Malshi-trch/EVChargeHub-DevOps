package com.evchargehub.backend.dto;

import com.evchargehub.backend.model.Role;

public record AuthResponse(String token, String name, String email, Role role) {
}
