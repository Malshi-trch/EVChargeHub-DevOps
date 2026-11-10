package com.evchargehub.service;

import com.evchargehub.dto.request.StationRequest;
import com.evchargehub.dto.response.StationResponse;

import java.util.List;

/**
 * Service interface for charging station discovery and management.
 */
public interface StationService {

    /**
     * Retrieves all active charging stations for public discovery.
     */
    List<StationResponse> getAllActiveStations();

    /**
     * Searches stations by name, city, or address keyword.
     */
    List<StationResponse> searchStations(String keyword);

    /**
     * Retrieves station details by ID.
     */
    StationResponse getStationById(Long stationId);

    /**
     * Creates a new station (only for station providers).
     */
    StationResponse createStation(Long providerId, StationRequest request);

    /**
     * Updates an existing station (only by its owner).
     */
    StationResponse updateStation(Long providerId, Long stationId, StationRequest request);

    /**
     * Deletes a station (only by its owner).
     */
    void deleteStation(Long providerId, Long stationId);

    /**
     * Retrieves all stations owned by a specific provider.
     */
    List<StationResponse> getStationsByProvider(Long providerId);
}

