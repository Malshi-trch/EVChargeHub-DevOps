package com.evchargehub.security;

import com.evchargehub.config.AppConfig;
import com.evchargehub.controller.AuthController;
import com.evchargehub.controller.BookingController;
import com.evchargehub.controller.StationController;
import com.evchargehub.dto.request.StationRequest;
import com.evchargehub.dto.response.StationResponse;
import com.evchargehub.entity.User;
import com.evchargehub.entity.enums.UserRole;
import com.evchargehub.exception.ForbiddenException;
import com.evchargehub.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {StationController.class, BookingController.class, AuthController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class, JwtAuthenticationEntryPoint.class, AppConfig.class})
class SecurityFilterChainIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @MockitoBean
    private StationService stationService;

    @MockitoBean
    private BookingService bookingService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private ChargerService chargerService;

    @MockitoBean
    private VehicleService vehicleService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String userToken;
    private String ownerToken;
    private String adminToken;
    private String expiredToken;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(1L);
        user.setEmail("user@evchargehub.lk");
        user.setFullName("Normal Driver");
        user.setRole(UserRole.ROLE_USER);

        User owner = new User();
        owner.setId(2L);
        owner.setEmail("owner@evchargehub.lk");
        owner.setFullName("Station Provider");
        owner.setRole(UserRole.ROLE_OWNER);

        User admin = new User();
        admin.setId(3L);
        admin.setEmail("admin@evchargehub.lk");
        admin.setFullName("Platform Admin");
        admin.setRole(UserRole.ROLE_ADMIN);

        userToken = tokenProvider.generateToken(user);
        ownerToken = tokenProvider.generateToken(owner);
        adminToken = tokenProvider.generateToken(admin);

        // Generate expired token safely using negative expiration
        JwtTokenProvider expiredProvider = new JwtTokenProvider(
                "test-secret-key-that-is-at-least-256-bits-long-for-hmac-sha256!", -1000
        );
        expiredToken = expiredProvider.generateToken(user);

        when(userDetailsService.loadUserByUsername("user@evchargehub.lk")).thenReturn(CustomUserDetails.fromUser(user));
        when(userDetailsService.loadUserByUsername("owner@evchargehub.lk")).thenReturn(CustomUserDetails.fromUser(owner));
        when(userDetailsService.loadUserByUsername("admin@evchargehub.lk")).thenReturn(CustomUserDetails.fromUser(admin));
    }

    @Test
    @DisplayName("Public endpoint (GET /api/stations) should be accessible without authentication")
    void testPublicEndpoint_Stations_PermitAll() throws Exception {
        when(stationService.getAllActiveStations()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/stations"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Protected endpoint (GET /api/bookings/my-bookings) without token should return 401 Unauthorized")
    void testProtectedEndpoint_MissingToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/bookings/my-bookings"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Protected endpoint with invalid JWT token should return 401 Unauthorized")
    void testProtectedEndpoint_InvalidToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/bookings/my-bookings")
                        .header("Authorization", "Bearer invalid-garbage-token-12345"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Protected endpoint with expired JWT token should return 401 Unauthorized")
    void testProtectedEndpoint_ExpiredToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/bookings/my-bookings")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Protected endpoint with valid user JWT token should return 200 OK")
    void testProtectedEndpoint_ValidToken_Returns200() throws Exception {
        when(bookingService.getMyBookings(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/bookings/my-bookings")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Provider-only endpoint (GET /api/provider/bookings) accessed by CUSTOMER should return 403 Forbidden")
    void testProviderEndpoint_AccessedByCustomer_Returns403() throws Exception {
        mockMvc.perform(get("/api/provider/bookings")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Station creation (POST /api/stations) attempted by CUSTOMER should return 403 Forbidden")
    void testStationCreation_AttemptedByCustomer_Returns403() throws Exception {
        StationRequest request = new StationRequest();
        request.setStationName("Colombo Fast Charging");
        request.setAddress("123 Galle Road");
        request.setCity("Colombo");
        request.setLatitude(6.9271);
        request.setLongitude(79.8612);

        mockMvc.perform(post("/api/stations")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Station creation (POST /api/stations) attempted by PROVIDER should return 201 Created")
    void testStationCreation_AttemptedByProvider_Returns201() throws Exception {
        StationRequest request = new StationRequest();
        request.setStationName("EcoCharge Station");
        request.setAddress("45 Kandy Road");
        request.setCity("Kandy");
        request.setLatitude(7.2906);
        request.setLongitude(80.6337);

        StationResponse response = new StationResponse();
        response.setId(10L);
        response.setStationName("EcoCharge Station");

        when(stationService.createStation(eq(2L), any(StationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/stations")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Station creation (POST /api/stations) attempted by ADMIN should return 201 Created")
    void testStationCreation_AttemptedByAdmin_Returns201() throws Exception {
        StationRequest request = new StationRequest();
        request.setStationName("Admin Super Hub");
        request.setAddress("1 Galle Face");
        request.setCity("Colombo");
        request.setLatitude(6.9271);
        request.setLongitude(79.8612);

        StationResponse response = new StationResponse();
        response.setId(11L);
        response.setStationName("Admin Super Hub");

        when(stationService.createStation(eq(3L), any(StationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/stations")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Provider-only endpoint (GET /api/provider/bookings) accessed by PROVIDER should return 200 OK")
    void testProviderEndpoint_AccessedByProvider_Returns200() throws Exception {
        when(bookingService.getProviderBookings(2L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/provider/bookings")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Provider-only endpoint (GET /api/provider/bookings) accessed by ADMIN should return 200 OK")
    void testProviderEndpoint_AccessedByAdmin_Returns200() throws Exception {
        when(bookingService.getProviderBookings(3L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/provider/bookings")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Resource ownership check: Accessing another user's booking returns 403 Forbidden")
    void testResourceOwnership_ViewingAnotherUsersBooking_Returns403() throws Exception {
        when(bookingService.getBookingById(eq(1L), eq(999L)))
                .thenThrow(new ForbiddenException("You do not have permission to view this booking."));

        mockMvc.perform(get("/api/bookings/999")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CORS preflight request (OPTIONS) from http://localhost:5173 should return 200 OK with CORS headers")
    void testCorsPreflight_Success() throws Exception {
        mockMvc.perform(options("/api/stations")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Authorization,Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("CORS simple GET request from http://localhost:5173 should include Access-Control-Allow-Origin")
    void testCorsGetRequest_Success() throws Exception {
        when(stationService.getAllActiveStations()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/stations")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("CORS POST request from http://localhost:5173 with Bearer token should include CORS origin header")
    void testCorsPostRequest_Success() throws Exception {
        StationRequest request = new StationRequest();
        request.setStationName("CORS Test Station");
        request.setAddress("Colombo");
        request.setCity("Colombo");
        request.setLatitude(6.9271);
        request.setLongitude(79.8612);

        StationResponse response = new StationResponse();
        response.setId(12L);

        when(stationService.createStation(eq(2L), any(StationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/stations")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }
}

