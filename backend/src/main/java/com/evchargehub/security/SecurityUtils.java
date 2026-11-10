package com.evchargehub.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility helper methods to retrieve details of the currently authenticated user
 * from the Spring Security context.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    /**
     * Retrieves the CustomUserDetails principal of the currently authenticated user.
     */
    public static CustomUserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails;
        }
        return null;
    }

    /**
     * Retrieves the primary key ID of the currently authenticated user.
     */
    public static Long getCurrentUserId() {
        CustomUserDetails userDetails = getCurrentUserDetails();
        return userDetails != null ? userDetails.getId() : null;
    }

    /**
     * Resolves the effective user ID, prioritizing the authenticated principal from JWT
     * and falling back to header/parameter if unauthenticated.
     */
    public static Long resolveUserId(Long explicitHeaderOrParamId) {
        Long authenticatedId = getCurrentUserId();
        if (authenticatedId != null) {
            return authenticatedId;
        }
        return explicitHeaderOrParamId;
    }
}

