package com.evchargehub.entity;

import com.evchargehub.entity.enums.StationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * STATION entity — represents an EV charging station.
 */
@Entity
@Table(name = "stations")
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @NotBlank(message = "Station name is required")
    @Size(max = 200, message = "Station name must be at most 200 characters")
    @Column(name = "station_name", nullable = false, length = 200)
    private String stationName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "Address is required")
    @Size(max = 300, message = "Address must be at most 300 characters")
    @Column(nullable = false, length = 300)
    private String address;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must be at most 100 characters")
    @Column(nullable = false, length = 100)
    private String city;

    @Size(max = 100)
    @Column(length = 100)
    private String district;

    @Size(max = 100)
    @Column(length = 100)
    private String province;

    @Size(max = 10)
    @Column(name = "postal_code", length = 10)
    private String postalCode;

    @NotNull(message = "Latitude is required")
    @Column(nullable = false)
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @Column(nullable = false)
    private Double longitude;

    @Column(name = "image", length = 500)
    private String image;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StationStatus status = StationStatus.ACTIVE;

    @Size(max = 100)
    @Column(name = "station_type", length = 100)
    private String stationType;

    @Column(name = "is_open_24_hours")
    private Boolean isOpen24Hours = false;

    @Column(name = "opening_time")
    private LocalTime openingTime;

    @Column(name = "closing_time")
    private LocalTime closingTime;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Charger> chargers = new ArrayList<>();

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Facility> facilities = new ArrayList<>();

    public Station() {
    }

    public Station(Long id, User provider, String stationName, String description, String address,
                   String city, String district, String province, String postalCode,
                   Double latitude, Double longitude, String image, StationStatus status,
                   String stationType, Boolean isOpen24Hours, LocalTime openingTime,
                   LocalTime closingTime, LocalDateTime createdAt) {
        this.id = id;
        this.provider = provider;
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
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = StationStatus.ACTIVE;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getProvider() {
        return provider;
    }

    public void setProvider(User provider) {
        this.provider = provider;
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

    public List<Charger> getChargers() {
        return chargers;
    }

    public void setChargers(List<Charger> chargers) {
        this.chargers = chargers;
    }

    public List<Facility> getFacilities() {
        return facilities;
    }

    public void setFacilities(List<Facility> facilities) {
        this.facilities = facilities;
    }
}
