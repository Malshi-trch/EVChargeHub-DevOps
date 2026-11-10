package com.evchargehub.controller;

import com.evchargehub.dto.request.LoginRequest;
import com.evchargehub.dto.request.RegisterRequest;
import com.evchargehub.dto.response.AuthResponse;
import com.evchargehub.dto.response.UserResponse;
import com.evchargehub.entity.enums.UserRole;
import com.evchargehub.exception.GlobalExceptionHandler;
import com.evchargehub.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/auth/register should return 201 Created upon successful registration")
    void testRegister_Success() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Kasun Perera", "kasun@example.com", "Password@123",
                "+94 77 123 4567", UserRole.ROLE_OWNER, "EcoCharge", "Colombo"
        );

        UserResponse userResponse = new UserResponse(
                1L, "Kasun Perera", "kasun@example.com", "+94 77 123 4567",
                UserRole.ROLE_OWNER, "EcoCharge", "Colombo", null, null, null
        );

        AuthResponse authResponse = AuthResponse.of(true, "User registered successfully", userResponse);

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.user.email").value("kasun@example.com"));
    }

    @Test
    @DisplayName("POST /api/auth/register should return 400 Bad Request when validation fails")
    void testRegister_ValidationError() throws Exception {
        // Missing required fields
        RegisterRequest request = new RegisterRequest();
        request.setEmail("not-an-email");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    @DisplayName("POST /api/auth/login should return 200 OK upon valid credentials")
    void testLogin_Success() throws Exception {
        LoginRequest request = new LoginRequest("user@example.com", "Secret@123");

        UserResponse userResponse = new UserResponse(
                2L, "EV User", "user@example.com", null, UserRole.ROLE_USER,
                null, null, null, null, null
        );

        AuthResponse authResponse = AuthResponse.of(true, "Login successful", userResponse);

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.id").value(2L));
    }

    @Test
    @DisplayName("GET /api/auth/profile/{id} should return 200 OK with profile")
    void testGetProfile_Success() throws Exception {
        UserResponse userResponse = new UserResponse(
                1L, "Kasun Perera", "kasun@example.com", "+94 77 123 4567",
                UserRole.ROLE_OWNER, "EcoCharge", "Colombo", null, null, null
        );

        when(authService.getUserProfile(1L)).thenReturn(userResponse);

        mockMvc.perform(get("/api/auth/profile/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Kasun Perera"))
                .andExpect(jsonPath("$.email").value("kasun@example.com"));
    }
}

