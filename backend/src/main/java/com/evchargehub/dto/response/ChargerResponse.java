package com.evchargehub.dto.response;

import com.evchargehub.entity.Charger;
import com.evchargehub.entity.enums.ChargerStatus;

import java.math.BigDecimal;

/**
 * Response DTO for a charger (charging bay).
 */
public class ChargerResponse {

    private Long id;
    private Long stationId;
    private String stationName;
    private String chargerName;
    private String chargerType;
    private BigDecimal chargingPower;
    private BigDecimal pricePerKwh;
    private ChargerStatus status;

    public ChargerResponse() {
    }

    public ChargerResponse(Long id, Long stationId, String stationName, String chargerName,
                           String chargerType, BigDecimal chargingPower, BigDecimal pricePerKwh,
                           ChargerStatus status) {
        this.id = id;
        this.stationId = stationId;
        this.stationName = stationName;
        this.chargerName = chargerName;
        this.chargerType = chargerType;
        this.chargingPower = chargingPower;
        this.pricePerKwh = pricePerKwh;
        this.status = status;
    }

    public static ChargerResponse fromEntity(Charger charger) {
        if (charger == null) {
            return null;
        }
        return new ChargerResponse(
                charger.getId(),
                charger.getStation() != null ? charger.getStation().getId() : null,
                charger.getStation() != null ? charger.getStation().getStationName() : null,
                charger.getChargerName(),
                charger.getChargerType(),
                charger.getChargingPower(),
                charger.getPricePerKwh(),
                charger.getStatus()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStationId() {
        return stationId;
    }

    public void setStationId(Long stationId) {
        this.stationId = stationId;
    }

    public String getStationName() {
        return stationName;
    }

    public void setStationName(String stationName) {
        this.stationName = stationName;
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
