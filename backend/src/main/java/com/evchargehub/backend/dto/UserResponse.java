package com.evchargehub.backend.dto;

import com.evchargehub.backend.model.Role;

public record UserResponse(Long id, String name, String email, Role role) {
}
