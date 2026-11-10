package com.evchargehub.controller;

import com.evchargehub.dto.request.ChargerRequest;
import com.evchargehub.dto.response.ChargerResponse;
import com.evchargehub.entity.enums.ChargerStatus;
import com.evchargehub.security.SecurityUtils;
import com.evchargehub.service.ChargerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing chargers (charging bays).
 * Base URLs: /api/chargers and /api/stations/{stationId}/chargers
 */
@RestController
public class ChargerController {

    private final ChargerService chargerService;

    public ChargerController(ChargerService chargerService) {
        this.chargerService = chargerService;
    }

    /**
     * Get all chargers, optionally filtered by stationId.
     * GET /api/chargers?stationId=1
     */
    @GetMapping("/api/chargers")
    public ResponseEntity<List<ChargerResponse>> getAllChargers(
            @RequestParam(value = "stationId", required = false) Long stationId) {
        if (stationId != null) {
            return ResponseEntity.ok(chargerService.getChargersByStation(stationId));
        }
        return ResponseEntity.ok(chargerService.getAllChargers());
    }

    /**
     * Get chargers belonging to a specific station.
     * GET /api/stations/{stationId}/chargers
     */
    @GetMapping("/api/stations/{stationId}/chargers")
    public ResponseEntity<List<ChargerResponse>> getChargersByStation(@PathVariable Long stationId) {
        return ResponseEntity.ok(chargerService.getChargersByStation(stationId));
    }

    /**
     * Get charger details by ID.
     * GET /api/chargers/{id}
     */
    @GetMapping("/api/chargers/{id}")
    public ResponseEntity<ChargerResponse> getChargerById(@PathVariable Long id) {
        return ResponseEntity.ok(chargerService.getChargerById(id));
    }

    /**
     * Create a new charger for a station (station providers only).
     * POST /api/stations/{stationId}/chargers
     */
    @PostMapping("/api/stations/{stationId}/chargers")
    public ResponseEntity<ChargerResponse> addCharger(
            @PathVariable Long stationId,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "providerId", required = false) Long paramProviderId,
            @Valid @RequestBody ChargerRequest request) {
        Long providerId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramProviderId);
        if (providerId == null) {
            throw new IllegalArgumentException("Provider ID must be specified via authentication token, 'X-User-Id' header, or 'providerId' parameter.");
        }
        ChargerResponse response = chargerService.addCharger(providerId, stationId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Update an existing charger.
     * PUT /api/chargers/{id}
     */
    @PutMapping("/api/chargers/{id}")
    public ResponseEntity<ChargerResponse> updateCharger(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "providerId", required = false) Long paramProviderId,
            @Valid @RequestBody ChargerRequest request) {
        Long providerId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramProviderId);
        if (providerId == null) {
            throw new IllegalArgumentException("Provider ID must be specified via authentication token, 'X-User-Id' header, or 'providerId' parameter.");
        }
        ChargerResponse response = chargerService.updateCharger(providerId, id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a charger.
     * DELETE /api/chargers/{id}
     */
    @DeleteMapping("/api/chargers/{id}")
    public ResponseEntity<Void> deleteCharger(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "providerId", required = false) Long paramProviderId) {
        Long providerId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramProviderId);
        if (providerId == null) {
            throw new IllegalArgumentException("Provider ID must be specified via authentication token, 'X-User-Id' header, or 'providerId' parameter.");
        }
        chargerService.deleteCharger(providerId, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update charger status (AVAILABLE, IN_USE, OFFLINE, MAINTENANCE).
     * PATCH /api/chargers/{id}/status?status=OFFLINE
     */
    @PatchMapping("/api/chargers/{id}/status")
    public ResponseEntity<ChargerResponse> updateChargerStatus(
            @PathVariable Long id,
            @RequestParam ChargerStatus status,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "providerId", required = false) Long paramProviderId) {
        Long providerId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramProviderId);
        if (providerId == null) {
            throw new IllegalArgumentException("Provider ID must be specified via authentication token, 'X-User-Id' header, or 'providerId' parameter.");
        }
        ChargerResponse response = chargerService.updateChargerStatus(providerId, id, status);
        return ResponseEntity.ok(response);
    }
}
