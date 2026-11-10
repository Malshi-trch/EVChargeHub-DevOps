package com.evchargehub.entity;

import com.evchargehub.entity.enums.ChargerStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * CHARGER entity — represents an individual charging point (bay) at a station.
 */
@Entity
@Table(name = "chargers")
public class Charger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @NotBlank(message = "Charger name is required")
    @Size(max = 100, message = "Charger name must be at most 100 characters")
    @Column(name = "charger_name", nullable = false, length = 100)
    private String chargerName;

    @NotBlank(message = "Charger type is required")
    @Size(max = 50, message = "Charger type must be at most 50 characters")
    @Column(name = "charger_type", nullable = false, length = 50)
    private String chargerType;

    @NotNull(message = "Charging power is required")
    @Positive(message = "Charging power must be positive")
    @Column(name = "charging_power", nullable = false, precision = 10, scale = 2)
    private BigDecimal chargingPower;

    @NotNull(message = "Price per kWh is required")
    @Positive(message = "Price must be positive")
    @Column(name = "price_per_kwh", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerKwh;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChargerStatus status = ChargerStatus.AVAILABLE;

    @OneToMany(mappedBy = "charger", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings = new ArrayList<>();

    public Charger() {
    }

    public Charger(Long id, Station station, String chargerName, String chargerType,
                   BigDecimal chargingPower, BigDecimal pricePerKwh, ChargerStatus status) {
        this.id = id;
        this.station = station;
        this.chargerName = chargerName;
        this.chargerType = chargerType;
        this.chargingPower = chargingPower;
        this.pricePerKwh = pricePerKwh;
        this.status = status;
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

    public String getChargerName() {
        return chargerName;
    }

    public void setChargerName(String chargerName) {
        this.chargerName = chargerName;
    }

    public String getChargerType() {
        return chargerType;
    }

    public void setChargerType(String chargerType) {
        this.chargerType = chargerType;
    }

    public BigDecimal getChargingPower() {
        return chargingPower;
    }

    public void setChargingPower(BigDecimal chargingPower) {
        this.chargingPower = chargingPower;
    }

    public BigDecimal getPricePerKwh() {
        return pricePerKwh;
    }

    public void setPricePerKwh(BigDecimal pricePerKwh) {
        this.pricePerKwh = pricePerKwh;
    }

    public ChargerStatus getStatus() {
        return status;
    }

    public void setStatus(ChargerStatus status) {
        this.status = status;
    }

    public List<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(List<Booking> bookings) {
        this.bookings = bookings;
    }
}
