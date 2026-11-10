package com.evchargehub.entity.enums;

/**
 * Defines the roles a user can have in the system.
 *
 * ROLE_USER  — EV driver / customer who searches stations and books charging slots.
 * ROLE_OWNER — Station provider who manages stations, chargers and station bookings.
 * ROLE_ADMIN — System administrator with oversight over all entities.
 *
 * The "ROLE_" prefix is a standard Spring Security convention.
 */
public enum UserRole {
    ROLE_USER,
    ROLE_OWNER,
    ROLE_ADMIN
}
