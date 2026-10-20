package com.evchargehub.backend.dto;

import com.evchargehub.backend.model.Role;
import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6) String password,
        @NotNull Role role) {
}
