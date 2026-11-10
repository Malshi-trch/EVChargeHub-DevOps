package com.evchargehub.entity.enums;

/**
 * Represents the lifecycle status of a booking.
 *
 * PENDING   — Booking created, waiting for confirmation.
 * CONFIRMED — Booking confirmed by the system or provider.
 * ACTIVE    — Charging session is currently in progress.
 * COMPLETED — Charging session finished successfully.
 * CANCELLED — Booking was cancelled by the user or provider.
 */
public enum BookingStatus {
    PENDING,
    CONFIRMED,
    ACTIVE,
    COMPLETED,
    CANCELLED
}

