package com.evchargehub.service;

import com.evchargehub.dto.request.LoginRequest;
import com.evchargehub.dto.request.RegisterRequest;
import com.evchargehub.dto.response.AuthResponse;
import com.evchargehub.entity.User;
import com.evchargehub.entity.enums.UserRole;
import com.evchargehub.exception.BadRequestException;
import com.evchargehub.repository.UserRepository;
import com.evchargehub.security.JwtTokenProvider;
import com.evchargehub.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceSecurityTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private JwtTokenProvider tokenProvider;
    private AuthServiceImpl authService;

    private User existingUser;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider("test-secret-key-that-is-at-least-256-bits-long-for-hmac-sha256!", 3600000);
        authService = new AuthServiceImpl(userRepository, passwordEncoder, tokenProvider);

        existingUser = new User();
        existingUser.setId(5L);
        existingUser.setEmail("owner@evchargehub.lk");
        existingUser.setFullName("Kasun Perera");
        existingUser.setPassword("$2a$10$hashedPasswordHere");
        existingUser.setRole(UserRole.ROLE_OWNER);
    }

    @Test
    @DisplayName("Should hash password and return signed JWT token upon registration")
    void testRegister_HashesPasswordAndGeneratesToken() {
        RegisterRequest request = new RegisterRequest(
                "Kasun Perera", "owner@evchargehub.lk", "MyPassword123!",
                "+94 77 123 4567", UserRole.ROLE_OWNER, "EcoCharge", "Colombo"
        );

        when(userRepository.existsByEmail("owner@evchargehub.lk")).thenReturn(false);
        when(passwordEncoder.encode("MyPassword123!")).thenReturn("$2a$10$hashedBCryptResult");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(5L);
            return u;
        });

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertNotNull(response.getToken());
        assertTrue(tokenProvider.validateToken(response.getToken()));
        assertEquals("owner@evchargehub.lk", tokenProvider.extractEmail(response.getToken()));
        assertEquals("Bearer", response.getTokenType());
        assertEquals("owner@evchargehub.lk", response.getUser().getEmail());
        verify(passwordEncoder, times(1)).encode("MyPassword123!");
    }

    @Test
    @DisplayName("Should verify password and return signed JWT token upon successful login")
    void testLogin_Success_ReturnsValidToken() {
        LoginRequest request = new LoginRequest("owner@evchargehub.lk", "MyPassword123!");

        when(userRepository.findByEmailIgnoreCase("owner@evchargehub.lk")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("MyPassword123!", "$2a$10$hashedPasswordHere")).thenReturn(true);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertNotNull(response.getToken());
        assertTrue(tokenProvider.validateToken(response.getToken()));
        assertEquals("owner@evchargehub.lk", tokenProvider.extractEmail(response.getToken()));
        assertEquals("Bearer", response.getTokenType());
        verify(userRepository, times(1)).save(existingUser);
    }

    @Test
    @DisplayName("Should reject login with 400 Bad Request when password is incorrect")
    void testLogin_IncorrectPassword_ThrowsBadRequest() {
        LoginRequest request = new LoginRequest("owner@evchargehub.lk", "WrongPassword!");

        when(userRepository.findByEmailIgnoreCase("owner@evchargehub.lk")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("WrongPassword!", "$2a$10$hashedPasswordHere")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authService.login(request)
        );

        assertTrue(ex.getMessage().contains("Invalid email or password"));
    }
}
