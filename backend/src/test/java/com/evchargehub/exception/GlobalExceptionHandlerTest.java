package com.evchargehub.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;
    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        request = new MockHttpServletRequest();
        request.setRequestURI("/api/bookings");
    }

    @Test
    @DisplayName("Should return 404 NOT_FOUND for ResourceNotFoundException")
    void testHandleResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Charger", "id", 100L);
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleResourceNotFoundException(ex, request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().getStatus());
        assertEquals("Not Found", response.getBody().getError());
        assertEquals("Charger not found with id: '100'", response.getBody().getMessage());
        assertEquals("/api/bookings", response.getBody().getPath());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    @DisplayName("Should return 409 CONFLICT for BookingConflictException")
    void testHandleBookingConflictException() {
        BookingConflictException ex = new BookingConflictException("Slot is already booked");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleBookingConflictException(ex, request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("Booking Conflict", response.getBody().getError());
        assertEquals("Slot is already booked", response.getBody().getMessage());
        assertEquals("/api/bookings", response.getBody().getPath());
    }

    @Test
    @DisplayName("Should return 400 BAD_REQUEST for IllegalArgumentException")
    void testHandleIllegalArgumentException() {
        IllegalArgumentException ex = new IllegalArgumentException("Booking end time must be after start time");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleIllegalArgumentException(ex, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("Bad Request", response.getBody().getError());
        assertEquals("Booking end time must be after start time", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Should return 403 FORBIDDEN for ForbiddenException")
    void testHandleForbiddenException() {
        ForbiddenException ex = new ForbiddenException("You cannot modify this booking");
        ResponseEntity<ErrorResponse> response = exceptionHandler.handleForbiddenException(ex, request);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(403, response.getBody().getStatus());
        assertEquals("Forbidden", response.getBody().getError());
    }
}

