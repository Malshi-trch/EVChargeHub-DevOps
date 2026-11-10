package com.evchargehub.entity.enums;

/**
 * Represents the current status of an individual charger (charging point).
 *
 * AVAILABLE   — Charger is free and can be booked.
 * IN_USE      — Charger is currently being used by a customer.
 * OFFLINE     — Charger is powered off or disconnected.
 * MAINTENANCE — Charger is under maintenance and not available.
 */
public enum ChargerStatus {
    AVAILABLE,
    IN_USE,
    OFFLINE,
    MAINTENANCE
}

