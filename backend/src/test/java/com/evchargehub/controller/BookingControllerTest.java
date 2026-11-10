package com.evchargehub.controller;

import com.evchargehub.dto.request.BookingRequest;
import com.evchargehub.dto.response.BookingResponse;
import com.evchargehub.entity.enums.BookingStatus;
import com.evchargehub.exception.BookingConflictException;
import com.evchargehub.exception.GlobalExceptionHandler;
import com.evchargehub.service.BookingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule());
        mockMvc = MockMvcBuilders.standaloneSetup(bookingController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/bookings should return 201 Created when booking is confirmed")
    void testCreateBooking_Success() throws Exception {
        LocalDate date = LocalDate.now().plusDays(2);
        BookingRequest request = new BookingRequest(
                100L, 50L, date, LocalTime.of(14, 0), LocalTime.of(15, 0), 60, BigDecimal.valueOf(35.0)
        );

        BookingResponse response = new BookingResponse();
        response.setId(1L);
        response.setBookingId("EVH-802101");
        response.setChargerId(100L);
        response.setChargerName("Bay 01");
        response.setStatus(BookingStatus.CONFIRMED);
        response.setTotalPrice(BigDecimal.valueOf(2975.0));

        when(bookingService.createBooking(eq(1L), any(BookingRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/bookings")
                        .header("X-User-Id", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookingId").value("EVH-802101"))
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.totalPrice").value(2975.0));
    }

    @Test
    @DisplayName("POST /api/bookings should return 409 Conflict when slot is already booked")
    void testCreateBooking_Conflict() throws Exception {
        LocalDate date = LocalDate.now().plusDays(2);
        BookingRequest request = new BookingRequest(
                100L, null, date, LocalTime.of(14, 0), LocalTime.of(15, 0), null, null
        );

        when(bookingService.createBooking(eq(1L), any(BookingRequest.class)))
                .thenThrow(new BookingConflictException("Charger 'Bay 01' is already booked for this time slot."));

        mockMvc.perform(post("/api/bookings")
                        .header("X-User-Id", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Booking Conflict"))
                .andExpect(jsonPath("$.message").value("Charger 'Bay 01' is already booked for this time slot."));
    }

    @Test
    @DisplayName("GET /api/bookings/my-bookings should return 200 OK with booking list")
    void testGetMyBookings_Success() throws Exception {
        BookingResponse b1 = new BookingResponse();
        b1.setId(10L);
        b1.setBookingId("EVH-100001");

        when(bookingService.getMyBookings(1L)).thenReturn(List.of(b1));

        mockMvc.perform(get("/api/bookings/my-bookings")
                        .header("X-User-Id", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].bookingId").value("EVH-100001"));
    }

    @Test
    @DisplayName("PUT /api/bookings/{id}/cancel should return 200 OK with cancelled status")
    void testCancelBooking_Success() throws Exception {
        BookingResponse response = new BookingResponse();
        response.setId(10L);
        response.setStatus(BookingStatus.CANCELLED);

        when(bookingService.cancelBooking(1L, 10L)).thenReturn(response);

        mockMvc.perform(put("/api/bookings/10/cancel")
                        .header("X-User-Id", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}

