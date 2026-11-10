package com.evchargehub.security;

import com.evchargehub.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utility component for generating, signing, extracting, and validating JWT tokens.
 */
@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationInMs;

    public JwtTokenProvider(
            @Value("${jwt.secret:default-dev-secret-change-in-production-must-be-at-least-256-bits-long}") String secret,
            @Value("${jwt.expiration:86400000}") long expirationInMs) {
        // Derive HMAC-SHA key from secret (ensuring at least 256 bits)
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] paddedKey = new byte[32];
            System.arraycopy(keyBytes, 0, paddedKey, 0, keyBytes.length);
            this.key = Keys.hmacShaKeyFor(paddedKey);
        } else {
            this.key = Keys.hmacShaKeyFor(keyBytes);
        }
        this.expirationInMs = expirationInMs;
    }

    /**
     * Generates a signed JWT token containing user identity and role claims.
     */
    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationInMs);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .claim("fullName", user.getFullName())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Generates a signed JWT token directly from CustomUserDetails.
     */
    public String generateToken(CustomUserDetails userDetails) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationInMs);

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("userId", userDetails.getId())
                .claim("role", userDetails.getRole().name())
                .claim("fullName", userDetails.getFullName())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Extracts user email from token subject.
     */
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    /**
     * Extracts user ID from token claims.
     */
    public Long extractUserId(String token) {
        Number userId = extractClaims(token).get("userId", Number.class);
        return userId != null ? userId.longValue() : null;
    }

    /**
     * Extracts user role from token claims.
     */
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    /**
     * Validates whether a token signature and structure are valid and unexpired.
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = extractClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extracts token claims payload.
     */
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

