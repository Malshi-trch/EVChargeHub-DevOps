package com.evchargehub.service;

import com.evchargehub.dto.request.VehicleRequest;
import com.evchargehub.dto.response.VehicleResponse;

import java.util.List;

/**
 * Service interface for managing EV user registered vehicles.
 */
public interface VehicleService {

    /**
     * Retrieves all vehicles registered by an EV user.
     */
    List<VehicleResponse> getMyVehicles(Long userId);

    /**
     * Retrieves a vehicle by ID (verifying user ownership).
     */
    VehicleResponse getVehicleById(Long userId, Long vehicleId);

    /**
     * Registers a new electric vehicle for an EV user.
     */
    VehicleResponse addVehicle(Long userId, VehicleRequest request);

    /**
     * Updates an existing vehicle.
     */
    VehicleResponse updateVehicle(Long userId, Long vehicleId, VehicleRequest request);

    /**
     * Deletes a vehicle.
     */
    void deleteVehicle(Long userId, Long vehicleId);
}

