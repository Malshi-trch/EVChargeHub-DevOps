package com.evchargehub.dto.request;

import com.evchargehub.entity.enums.ChargerStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Request payload for creating or updating a charger.
 */
public class ChargerRequest {

    @NotBlank(message = "Charger name is required")
    @Size(max = 100, message = "Charger name must be at most 100 characters")
    private String chargerName;

    @NotBlank(message = "Charger type is required (e.g., CCS, Type 2, CHAdeMO)")
    @Size(max = 50, message = "Charger type must be at most 50 characters")
    private String chargerType;

    @NotNull(message = "Charging power is required")
    @Positive(message = "Charging power must be positive")
    private BigDecimal chargingPower;

    @NotNull(message = "Price per kWh is required")
    @Positive(message = "Price per kWh must be positive")
    private BigDecimal pricePerKwh;

    private ChargerStatus status;

    public ChargerRequest() {
    }

    public ChargerRequest(String chargerName, String chargerType, BigDecimal chargingPower,
                          BigDecimal pricePerKwh, ChargerStatus status) {
        this.chargerName = chargerName;
        this.chargerType = chargerType;
        this.chargingPower = chargingPower;
        this.pricePerKwh = pricePerKwh;
        this.status = status;
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
}
