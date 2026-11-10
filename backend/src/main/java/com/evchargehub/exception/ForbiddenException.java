package com.evchargehub.exception;

/**
 * Thrown when an authenticated user attempts to access or modify a resource
 * owned by another user, or requires a different role.
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}

