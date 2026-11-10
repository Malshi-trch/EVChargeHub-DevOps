package com.evchargehub.security;

import com.evchargehub.entity.User;
import com.evchargehub.entity.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String secret = "test-secret-key-that-is-at-least-256-bits-long-for-hmac-sha256!";
    private final long expirationMs = 3600000; // 1 hour

    private User testUser;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(secret, expirationMs);

        testUser = new User();
        testUser.setId(101L);
        testUser.setFullName("Hareen Janith");
        testUser.setEmail("hareen@evchargehub.lk");
        testUser.setRole(UserRole.ROLE_USER);
    }

    @Test
    @DisplayName("Should generate valid JWT token with correct claims")
    void testGenerateToken_Success() {
        String token = tokenProvider.generateToken(testUser);

        assertNotNull(token);
        assertTrue(token.length() > 20);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("hareen@evchargehub.lk", tokenProvider.extractEmail(token));
        assertEquals(101L, tokenProvider.extractUserId(token));
        assertEquals("ROLE_USER", tokenProvider.extractRole(token));
    }

    @Test
    @DisplayName("Should reject malformed JWT token")
    void testValidateToken_Malformed() {
        assertFalse(tokenProvider.validateToken("invalid.token.structure"));
        assertFalse(tokenProvider.validateToken(null));
        assertFalse(tokenProvider.validateToken(""));
    }

    @Test
    @DisplayName("Should reject JWT token signed with a different secret")
    void testValidateToken_TamperedSignature() {
        JwtTokenProvider otherProvider = new JwtTokenProvider("completely-different-secret-key-for-testing-tampering-12345", 3600000);
        String forgedToken = otherProvider.generateToken(testUser);

        assertFalse(tokenProvider.validateToken(forgedToken));
    }

    @Test
    @DisplayName("Should reject expired JWT token")
    void testValidateToken_Expired() {
        // Create token provider with negative expiration (-1 ms = already expired)
        JwtTokenProvider expiredProvider = new JwtTokenProvider(secret, -1000);
        String expiredToken = expiredProvider.generateToken(testUser);

        assertFalse(tokenProvider.validateToken(expiredToken));
    }
}

