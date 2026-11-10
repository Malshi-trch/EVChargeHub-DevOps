package com.evchargehub.dto.request;

import com.evchargehub.entity.enums.StationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;
import java.util.List;

/**
 * Request payload for creating or updating a charging station.
 */
public class StationRequest {

    @NotBlank(message = "Station name is required")
    @Size(max = 200, message = "Station name must be at most 200 characters")
    private String stationName;

    private String description;

    @NotBlank(message = "Address is required")
    @Size(max = 300, message = "Address must be at most 300 characters")
    private String address;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must be at most 100 characters")
    private String city;

    @Size(max = 100, message = "District must be at most 100 characters")
    private String district;

    @Size(max = 100, message = "Province must be at most 100 characters")
    private String province;

    @Size(max = 10, message = "Postal code must be at most 10 characters")
    private String postalCode;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String image;

    private StationStatus status;

    private String stationType;

    private Boolean isOpen24Hours;

    private LocalTime openingTime;

    private LocalTime closingTime;

    private List<String> facilities;

    public StationRequest() {
    }

    public StationRequest(String stationName, String description, String address, String city,
                          String district, String province, String postalCode, Double latitude,
                          Double longitude, String image, StationStatus status, String stationType,
                          Boolean isOpen24Hours, LocalTime openingTime, LocalTime closingTime,
                          List<String> facilities) {
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
        this.facilities = facilities;
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

    public List<String> getFacilities() {
        return facilities;
    }

    public void setFacilities(List<String> facilities) {
        this.facilities = facilities;
    }
}
