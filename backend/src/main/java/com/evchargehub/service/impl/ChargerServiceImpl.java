package com.evchargehub.service.impl;

import com.evchargehub.dto.request.ChargerRequest;
import com.evchargehub.dto.response.ChargerResponse;
import com.evchargehub.entity.Charger;
import com.evchargehub.entity.Station;
import com.evchargehub.entity.enums.ChargerStatus;
import com.evchargehub.exception.ForbiddenException;
import com.evchargehub.exception.ResourceNotFoundException;
import com.evchargehub.repository.ChargerRepository;
import com.evchargehub.repository.StationRepository;
import com.evchargehub.service.ChargerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ChargerService.
 */
@Service
public class ChargerServiceImpl implements ChargerService {

    private final ChargerRepository chargerRepository;
    private final StationRepository stationRepository;

    public ChargerServiceImpl(ChargerRepository chargerRepository, StationRepository stationRepository) {
        this.chargerRepository = chargerRepository;
        this.stationRepository = stationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChargerResponse> getAllChargers() {
        return chargerRepository.findAll()
                .stream()
                .map(ChargerResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChargerResponse> getChargersByStation(Long stationId) {
        if (!stationRepository.existsById(stationId)) {
            throw new ResourceNotFoundException("Station", "id", stationId);
        }
        return chargerRepository.findByStationId(stationId)
                .stream()
                .map(ChargerResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChargerResponse getChargerById(Long chargerId) {
        Charger charger = chargerRepository.findById(chargerId)
                .orElseThrow(() -> new ResourceNotFoundException("Charger", "id", chargerId));
        return ChargerResponse.fromEntity(charger);
    }

    @Override
    @Transactional
    public ChargerResponse addCharger(Long providerId, Long stationId, ChargerRequest request) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station", "id", stationId));

        if (!station.getProvider().getId().equals(providerId)) {
            throw new ForbiddenException("You can only add chargers to stations that you own.");
        }

        Charger charger = new Charger();
        charger.setStation(station);
        charger.setChargerName(request.getChargerName().trim());
        charger.setChargerType(request.getChargerType().trim());
        charger.setChargingPower(request.getChargingPower());
        charger.setPricePerKwh(request.getPricePerKwh());
        charger.setStatus(request.getStatus() != null ? request.getStatus() : ChargerStatus.AVAILABLE);

        Charger savedCharger = chargerRepository.save(charger);
        return ChargerResponse.fromEntity(savedCharger);
    }

    @Override
    @Transactional
    public ChargerResponse updateCharger(Long providerId, Long chargerId, ChargerRequest request) {
        Charger charger = chargerRepository.findById(chargerId)
                .orElseThrow(() -> new ResourceNotFoundException("Charger", "id", chargerId));

        if (!charger.getStation().getProvider().getId().equals(providerId)) {
            throw new ForbiddenException("You can only update chargers belonging to your stations.");
        }

        charger.setChargerName(request.getChargerName().trim());
        charger.setChargerType(request.getChargerType().trim());
        charger.setChargingPower(request.getChargingPower());
        charger.setPricePerKwh(request.getPricePerKwh());
        if (request.getStatus() != null) {
            charger.setStatus(request.getStatus());
        }

        Charger updatedCharger = chargerRepository.save(charger);
        return ChargerResponse.fromEntity(updatedCharger);
    }

    @Override
    @Transactional
    public void deleteCharger(Long providerId, Long chargerId) {
        Charger charger = chargerRepository.findById(chargerId)
                .orElseThrow(() -> new ResourceNotFoundException("Charger", "id", chargerId));

        if (!charger.getStation().getProvider().getId().equals(providerId)) {
            throw new ForbiddenException("You can only delete chargers belonging to your stations.");
        }

        chargerRepository.delete(charger);
    }

    @Override
    @Transactional
    public ChargerResponse updateChargerStatus(Long providerId, Long chargerId, ChargerStatus status) {
        Charger charger = chargerRepository.findById(chargerId)
                .orElseThrow(() -> new ResourceNotFoundException("Charger", "id", chargerId));

        if (!charger.getStation().getProvider().getId().equals(providerId)) {
            throw new ForbiddenException("You can only change status for chargers belonging to your stations.");
        }

        charger.setStatus(status);
        Charger updatedCharger = chargerRepository.save(charger);
        return ChargerResponse.fromEntity(updatedCharger);
    }
}
