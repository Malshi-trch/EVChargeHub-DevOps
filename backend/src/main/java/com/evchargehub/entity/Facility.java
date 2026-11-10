package com.evchargehub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * FACILITY entity — represents an amenity available at a charging station.
 */
@Entity
@Table(name = "facilities")
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @NotBlank(message = "Facility name is required")
    @Size(max = 100, message = "Facility name must be at most 100 characters")
    @Column(name = "facility_name", nullable = false, length = 100)
    private String facilityName;

    public Facility() {
    }

    public Facility(Long id, Station station, String facilityName) {
        this.id = id;
        this.station = station;
        this.facilityName = facilityName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Station getStation() {
        return station;
    }

    public void setStation(Station station) {
        this.station = station;
    }

    public String getFacilityName() {
        return facilityName;
    }

    public void setFacilityName(String facilityName) {
        this.facilityName = facilityName;
    }
}
