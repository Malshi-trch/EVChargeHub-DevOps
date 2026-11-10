package com.evchargehub.exception;

/**
 * Thrown when an invalid input, operation, or state transition is requested.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}

