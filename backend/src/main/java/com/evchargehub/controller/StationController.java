package com.evchargehub.controller;

import com.evchargehub.dto.request.StationRequest;
import com.evchargehub.dto.response.StationResponse;
import com.evchargehub.security.SecurityUtils;
import com.evchargehub.service.StationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for charging station discovery and provider management.
 * Base URL: /api/stations
 */
@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final StationService stationService;

    public StationController(StationService stationService) {
        this.stationService = stationService;
    }

    /**
     * Get all active charging stations or search by keyword (name, city, address).
     * GET /api/stations?keyword=galle
     */
    @GetMapping
    public ResponseEntity<List<StationResponse>> getStations(
            @RequestParam(value = "keyword", required = false) String keyword) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return ResponseEntity.ok(stationService.searchStations(keyword));
        }
        return ResponseEntity.ok(stationService.getAllActiveStations());
    }

    /**
     * Get station details by ID.
     * GET /api/stations/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<StationResponse> getStationById(@PathVariable Long id) {
        return ResponseEntity.ok(stationService.getStationById(id));
    }

    /**
     * Get all stations owned by a specific provider.
     * GET /api/stations/provider/{providerId}
     */
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<StationResponse>> getStationsByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(stationService.getStationsByProvider(providerId));
    }

    /**
     * Create a new charging station (station providers only).
     * POST /api/stations
     */
    @PostMapping
    public ResponseEntity<StationResponse> createStation(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "providerId", required = false) Long paramProviderId,
            @Valid @RequestBody StationRequest request) {
        Long providerId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramProviderId);
        if (providerId == null) {
            throw new IllegalArgumentException("Provider ID must be specified via authentication token, 'X-User-Id' header, or 'providerId' parameter.");
        }
        StationResponse response = stationService.createStation(providerId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Update an existing charging station.
     * PUT /api/stations/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<StationResponse> updateStation(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "providerId", required = false) Long paramProviderId,
            @Valid @RequestBody StationRequest request) {
        Long providerId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramProviderId);
        if (providerId == null) {
            throw new IllegalArgumentException("Provider ID must be specified via authentication token, 'X-User-Id' header, or 'providerId' parameter.");
        }
        StationResponse response = stationService.updateStation(providerId, id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a charging station.
     * DELETE /api/stations/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStation(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "providerId", required = false) Long paramProviderId) {
        Long providerId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramProviderId);
        if (providerId == null) {
            throw new IllegalArgumentException("Provider ID must be specified via authentication token, 'X-User-Id' header, or 'providerId' parameter.");
        }
        stationService.deleteStation(providerId, id);
        return ResponseEntity.noContent().build();
    }
}
