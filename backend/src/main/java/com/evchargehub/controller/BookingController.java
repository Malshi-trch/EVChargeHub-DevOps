package com.evchargehub.controller;

import com.evchargehub.dto.request.BookingRequest;
import com.evchargehub.dto.request.BookingStatusUpdateRequest;
import com.evchargehub.dto.response.BookingResponse;
import com.evchargehub.security.SecurityUtils;
import com.evchargehub.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for booking creation, conflict checking, and booking lifecycle management.
 * Base URLs: /api/bookings and /api/provider/bookings
 */
@RestController
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Create a new booking slot reservation with conflict detection.
     * POST /api/bookings
     */
    @PostMapping("/api/bookings")
    public ResponseEntity<BookingResponse> createBooking(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @Valid @RequestBody BookingRequest request) {
        Long userId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramUserId);
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be specified via authentication token, 'X-User-Id' header, or 'userId' parameter.");
        }
        BookingResponse response = bookingService.createBooking(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get bookings for the authenticated EV customer.
     * GET /api/bookings/my-bookings
     */
    @GetMapping({"/api/bookings/my-bookings", "/api/bookings"})
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "userId", required = false) Long paramUserId) {
        Long userId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramUserId);
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be specified via authentication token, 'X-User-Id' header, or 'userId' parameter.");
        }
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    /**
     * Get booking details by ID.
     * GET /api/bookings/{id}
     */
    @GetMapping("/api/bookings/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "userId", required = false) Long paramUserId) {
        Long userId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramUserId);
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be specified via authentication token, 'X-User-Id' header, or 'userId' parameter.");
        }
        return ResponseEntity.ok(bookingService.getBookingById(userId, id));
    }

    /**
     * Cancel an existing booking.
     * PUT /api/bookings/{id}/cancel
     */
    @PutMapping("/api/bookings/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "userId", required = false) Long paramUserId) {
        Long userId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramUserId);
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be specified via authentication token, 'X-User-Id' header, or 'userId' parameter.");
        }
        return ResponseEntity.ok(bookingService.cancelBooking(userId, id));
    }

    /**
     * Get all bookings for stations owned by the authenticated provider.
     * GET /api/provider/bookings
     */
    @GetMapping("/api/provider/bookings")
    public ResponseEntity<List<BookingResponse>> getProviderBookings(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "providerId", required = false) Long paramProviderId) {
        Long providerId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramProviderId);
        if (providerId == null) {
            throw new IllegalArgumentException("Provider ID must be specified via authentication token, 'X-User-Id' header, or 'providerId' parameter.");
        }
        return ResponseEntity.ok(bookingService.getProviderBookings(providerId));
    }

    /**
     * Update booking status by the station provider.
     * PUT /api/bookings/{id}/status
     */
    @PutMapping("/api/bookings/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "providerId", required = false) Long paramProviderId,
            @Valid @RequestBody BookingStatusUpdateRequest request) {
        Long providerId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramProviderId);
        if (providerId == null) {
            throw new IllegalArgumentException("Provider ID must be specified via authentication token, 'X-User-Id' header, or 'providerId' parameter.");
        }
        return ResponseEntity.ok(bookingService.updateBookingStatus(providerId, id, request.getStatus()));
    }
}
