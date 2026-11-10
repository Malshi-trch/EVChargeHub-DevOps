package com.evchargehub.controller;

import com.evchargehub.dto.request.VehicleRequest;
import com.evchargehub.dto.response.VehicleResponse;
import com.evchargehub.security.SecurityUtils;
import com.evchargehub.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for EV driver vehicle registration and management.
 * Base URL: /api/vehicles
 */
@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    /**
     * Get all vehicles registered by the authenticated user.
     * GET /api/vehicles/my-vehicles or GET /api/vehicles
     */
    @GetMapping({"", "/my-vehicles"})
    public ResponseEntity<List<VehicleResponse>> getMyVehicles(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "userId", required = false) Long paramUserId) {
        Long userId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramUserId);
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be specified via authentication token, 'X-User-Id' header, or 'userId' parameter.");
        }
        return ResponseEntity.ok(vehicleService.getMyVehicles(userId));
    }

    /**
     * Get a registered vehicle by ID.
     * GET /api/vehicles/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> getVehicleById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "userId", required = false) Long paramUserId) {
        Long userId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramUserId);
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be specified via authentication token, 'X-User-Id' header, or 'userId' parameter.");
        }
        return ResponseEntity.ok(vehicleService.getVehicleById(userId, id));
    }

    /**
     * Register a new vehicle.
     * POST /api/vehicles
     */
    @PostMapping
    public ResponseEntity<VehicleResponse> addVehicle(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @Valid @RequestBody VehicleRequest request) {
        Long userId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramUserId);
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be specified via authentication token, 'X-User-Id' header, or 'userId' parameter.");
        }
        VehicleResponse response = vehicleService.addVehicle(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Update an existing vehicle.
     * PUT /api/vehicles/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "userId", required = false) Long paramUserId,
            @Valid @RequestBody VehicleRequest request) {
        Long userId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramUserId);
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be specified via authentication token, 'X-User-Id' header, or 'userId' parameter.");
        }
        VehicleResponse response = vehicleService.updateVehicle(userId, id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a vehicle.
     * DELETE /api/vehicles/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "userId", required = false) Long paramUserId) {
        Long userId = SecurityUtils.resolveUserId(headerUserId != null ? headerUserId : paramUserId);
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be specified via authentication token, 'X-User-Id' header, or 'userId' parameter.");
        }
        vehicleService.deleteVehicle(userId, id);
        return ResponseEntity.noContent().build();
    }
}
