package com.evchargehub.dto.response;

import com.evchargehub.entity.Facility;
import com.evchargehub.entity.Station;
import com.evchargehub.entity.enums.StationStatus;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Response DTO for a charging station.
 */
public class StationResponse {

    private Long id;
    private Long providerId;
    private String providerName;
    private String stationName;
    private String description;
    private String address;
    private String city;
    private String district;
    private String province;
    private String postalCode;
    private Double latitude;
    private Double longitude;
    private String image;
    private StationStatus status;
    private String stationType;
    private Boolean isOpen24Hours;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private LocalDateTime createdAt;
    private List<ChargerResponse> chargers;
    private List<String> facilities;
    private Long totalChargers;
    private Long availableChargers;

    public StationResponse() {
    }

    public StationResponse(Long id, Long providerId, String providerName, String stationName,
                           String description, String address, String city, String district,
                           String province, String postalCode, Double latitude, Double longitude,
                           String image, StationStatus status, String stationType,
                           Boolean isOpen24Hours, LocalTime openingTime, LocalTime closingTime,
                           LocalDateTime createdAt, List<ChargerResponse> chargers,
                           List<String> facilities, Long totalChargers, Long availableChargers) {
        this.id = id;
        this.providerId = providerId;
        this.providerName = providerName;
        this.stationName = stationName;
        this.description = description;
        this.address = address;
        this.city = city;
        this.district = district;
        this.province = province;
        this.postalCode = postalCode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.image = image;
        this.status = status;
        this.stationType = stationType;
        this.isOpen24Hours = isOpen24Hours;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
        this.createdAt = createdAt;
        this.chargers = chargers;
        this.facilities = facilities;
        this.totalChargers = totalChargers;
        this.availableChargers = availableChargers;
    }

    public static StationResponse fromEntity(Station station) {
        if (station == null) {
            return null;
        }

        List<ChargerResponse> chargerResponses = station.getChargers() != null
                ? station.getChargers().stream().map(ChargerResponse::fromEntity).collect(Collectors.toList())
                : Collections.emptyList();

        List<String> facilityNames = station.getFacilities() != null
                ? station.getFacilities().stream().map(Facility::getFacilityName).collect(Collectors.toList())
                : Collections.emptyList();

        long availableCount = chargerResponses.stream()
                .filter(c -> c.getStatus() != null && c.getStatus().name().equals("AVAILABLE"))
                .count();

        return new StationResponse(
                station.getId(),
                station.getProvider() != null ? station.getProvider().getId() : null,
                station.getProvider() != null ? station.getProvider().getFullName() : null,
                station.getStationName(),
                station.getDescription(),
                station.getAddress(),
                station.getCity(),
                station.getDistrict(),
                station.getProvince(),
                station.getPostalCode(),
                station.getLatitude(),
                station.getLongitude(),
                station.getImage(),
                station.getStatus(),
                station.getStationType(),
                station.getIsOpen24Hours(),
                station.getOpeningTime(),
                station.getClosingTime(),
                station.getCreatedAt(),
                chargerResponses,
                facilityNames,
                (long) chargerResponses.size(),
                availableCount
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProviderId() {
        return providerId;
    }

    public void setProviderId(Long providerId) {
        this.providerId = providerId;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getStationName() {
        return stationName;
    }

    public void setStationName(String stationName) {
        this.stationName = stationName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public StationStatus getStatus() {
        return status;
    }

    public void setStatus(StationStatus status) {
        this.status = status;
    }

    public String getStationType() {
        return stationType;
    }

    public void setStationType(String stationType) {
        this.stationType = stationType;
    }

    public Boolean getIsOpen24Hours() {
        return isOpen24Hours;
    }

    public void setIsOpen24Hours(Boolean open24Hours) {
        isOpen24Hours = open24Hours;
    }

    public LocalTime getOpeningTime() {
        return openingTime;
    }

    public void setOpeningTime(LocalTime openingTime) {
        this.openingTime = openingTime;
    }

    public LocalTime getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(LocalTime closingTime) {
        this.closingTime = closingTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<ChargerResponse> getChargers() {
        return chargers;
    }

    public void setChargers(List<ChargerResponse> chargers) {
        this.chargers = chargers;
    }

    public List<String> getFacilities() {
        return facilities;
    }

    public void setFacilities(List<String> facilities) {
        this.facilities = facilities;
    }

    public Long getTotalChargers() {
        return totalChargers;
    }

    public void setTotalChargers(Long totalChargers) {
        this.totalChargers = totalChargers;
    }

    public Long getAvailableChargers() {
        return availableChargers;
    }

    public void setAvailableChargers(Long availableChargers) {
        this.availableChargers = availableChargers;
    }
}
