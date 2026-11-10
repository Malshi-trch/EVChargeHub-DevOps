package com.evchargehub.service.impl;

import com.evchargehub.dto.request.StationRequest;
import com.evchargehub.dto.response.StationResponse;
import com.evchargehub.entity.Facility;
import com.evchargehub.entity.Station;
import com.evchargehub.entity.User;
import com.evchargehub.entity.enums.StationStatus;
import com.evchargehub.entity.enums.UserRole;
import com.evchargehub.exception.ForbiddenException;
import com.evchargehub.exception.ResourceNotFoundException;
import com.evchargehub.repository.StationRepository;
import com.evchargehub.repository.UserRepository;
import com.evchargehub.service.StationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of StationService.
 */
@Service
public class StationServiceImpl implements StationService {

    private final StationRepository stationRepository;
    private final UserRepository userRepository;

    public StationServiceImpl(StationRepository stationRepository,
                              UserRepository userRepository) {
        this.stationRepository = stationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StationResponse> getAllActiveStations() {
        return stationRepository.findByStatusOrderByCreatedAtDesc(StationStatus.ACTIVE)
                .stream()
                .map(StationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StationResponse> searchStations(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllActiveStations();
        }
        return stationRepository.searchByKeyword(keyword.trim())
                .stream()
                .map(StationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StationResponse getStationById(Long stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station", "id", stationId));
        return StationResponse.fromEntity(station);
    }

    @Override
    @Transactional
    public StationResponse createStation(Long providerId, StationRequest request) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider", "id", providerId));

        if (provider.getRole() != UserRole.ROLE_OWNER) {
            throw new ForbiddenException("Only registered station providers (ROLE_OWNER) can create charging stations.");
        }

        Station station = new Station();
        station.setProvider(provider);
        station.setStationName(request.getStationName().trim());
        station.setDescription(request.getDescription());
        station.setAddress(request.getAddress().trim());
        station.setCity(request.getCity().trim());
        station.setDistrict(request.getDistrict());
        station.setProvince(request.getProvince());
        station.setPostalCode(request.getPostalCode());
        station.setLatitude(request.getLatitude());
        station.setLongitude(request.getLongitude());
        station.setImage(request.getImage());
        station.setStatus(request.getStatus() != null ? request.getStatus() : StationStatus.ACTIVE);
        station.setStationType(request.getStationType());
        station.setIsOpen24Hours(request.getIsOpen24Hours() != null ? request.getIsOpen24Hours() : false);
        station.setOpeningTime(request.getOpeningTime());
        station.setClosingTime(request.getClosingTime());

        if (request.getFacilities() != null) {
            List<Facility> facilities = request.getFacilities().stream()
                    .filter(name -> name != null && !name.trim().isEmpty())
                    .map(name -> new Facility(null, station, name.trim()))
                    .collect(Collectors.toList());
            station.setFacilities(facilities);
        }

        Station savedStation = stationRepository.save(station);
        return StationResponse.fromEntity(savedStation);
    }

    @Override
    @Transactional
    public StationResponse updateStation(Long providerId, Long stationId, StationRequest request) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station", "id", stationId));

        if (!station.getProvider().getId().equals(providerId)) {
            throw new ForbiddenException("You do not have permission to update this station.");
        }

        station.setStationName(request.getStationName().trim());
        station.setDescription(request.getDescription());
        station.setAddress(request.getAddress().trim());
        station.setCity(request.getCity().trim());
        station.setDistrict(request.getDistrict());
        station.setProvince(request.getProvince());
        station.setPostalCode(request.getPostalCode());
        station.setLatitude(request.getLatitude());
        station.setLongitude(request.getLongitude());
        station.setImage(request.getImage());
        if (request.getStatus() != null) {
            station.setStatus(request.getStatus());
        }
        station.setStationType(request.getStationType());
        station.setIsOpen24Hours(request.getIsOpen24Hours() != null ? request.getIsOpen24Hours() : false);
        station.setOpeningTime(request.getOpeningTime());
        station.setClosingTime(request.getClosingTime());

        if (request.getFacilities() != null) {
            station.getFacilities().clear();
            List<Facility> newFacilities = request.getFacilities().stream()
                    .filter(name -> name != null && !name.trim().isEmpty())
                    .map(name -> new Facility(null, station, name.trim()))
                    .collect(Collectors.toList());
            station.getFacilities().addAll(newFacilities);
        }

        Station updatedStation = stationRepository.save(station);
        return StationResponse.fromEntity(updatedStation);
    }

    @Override
    @Transactional
    public void deleteStation(Long providerId, Long stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station", "id", stationId));

        if (!station.getProvider().getId().equals(providerId)) {
            throw new ForbiddenException("You do not have permission to delete this station.");
        }

        stationRepository.delete(station);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StationResponse> getStationsByProvider(Long providerId) {
        return stationRepository.findByProviderId(providerId)
                .stream()
                .map(StationResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
