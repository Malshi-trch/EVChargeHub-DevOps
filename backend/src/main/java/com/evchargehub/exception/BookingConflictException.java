package com.evchargehub.exception;

/**
 * Thrown when a booking time slot conflicts with an existing confirmed booking for the same charger.
 */
public class BookingConflictException extends RuntimeException {

    public BookingConflictException(String message) {
        super(message);
    }
}

