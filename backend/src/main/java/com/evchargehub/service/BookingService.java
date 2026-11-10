package com.evchargehub.service;

import com.evchargehub.dto.request.BookingRequest;
import com.evchargehub.dto.response.BookingResponse;
import com.evchargehub.entity.enums.BookingStatus;

import java.util.List;

/**
 * Service interface for booking charging slots, conflict validation,
 * and lifecycle management.
 */
public interface BookingService {

    /**
     * Creates a new booking after strictly validating slot conflicts.
     */
    BookingResponse createBooking(Long userId, BookingRequest request);

    /**
     * Retrieves all bookings for the currently authenticated EV user.
     */
    List<BookingResponse> getMyBookings(Long userId);

    /**
     * Retrieves a single booking by ID (only if the user is owner or station provider).
     */
    BookingResponse getBookingById(Long userId, Long bookingId);

    /**
     * Cancels an existing booking.
     */
    BookingResponse cancelBooking(Long userId, Long bookingId);

    /**
     * Retrieves all bookings across all stations owned by a provider.
     */
    List<BookingResponse> getProviderBookings(Long providerId);

    /**
     * Updates booking status (e.g., CONFIRMED, ACTIVE, COMPLETED, CANCELLED) by provider.
     */
    BookingResponse updateBookingStatus(Long providerId, Long bookingId, BookingStatus newStatus);
}

