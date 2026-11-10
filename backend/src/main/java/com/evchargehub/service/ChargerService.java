package com.evchargehub.service;

import com.evchargehub.dto.request.ChargerRequest;
import com.evchargehub.dto.response.ChargerResponse;
import com.evchargehub.entity.enums.ChargerStatus;

import java.util.List;

/**
 * Service interface for charger (charging bay) management.
 */
public interface ChargerService {

    /**
     * Retrieves all chargers across all stations.
     */
    List<ChargerResponse> getAllChargers();

    /**
     * Retrieves all chargers for a given station.
     */
    List<ChargerResponse> getChargersByStation(Long stationId);

    /**
     * Retrieves a charger by ID.
     */
    ChargerResponse getChargerById(Long chargerId);

    /**
     * Adds a new charger to a station (only by the station owner).
     */
    ChargerResponse addCharger(Long providerId, Long stationId, ChargerRequest request);

    /**
     * Updates an existing charger (only by the station owner).
     */
    ChargerResponse updateCharger(Long providerId, Long chargerId, ChargerRequest request);

    /**
     * Deletes a charger (only by the station owner).
     */
    void deleteCharger(Long providerId, Long chargerId);

    /**
     * Updates charger availability status.
     */
    ChargerResponse updateChargerStatus(Long providerId, Long chargerId, ChargerStatus status);
}

