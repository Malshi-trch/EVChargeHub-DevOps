package com.evchargehub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Request payload for creating or updating an electric vehicle.
 */
public class VehicleRequest {

    @NotBlank(message = "Vehicle name is required")
    @Size(max = 100, message = "Vehicle name must be at most 100 characters")
    private String vehicleName;

    @NotBlank(message = "Vehicle model is required")
    @Size(max = 100, message = "Vehicle model must be at most 100 characters")
    private String vehicleModel;

    @Size(max = 30, message = "Registration number must be at most 30 characters")
    private String registrationNumber;

    @Positive(message = "Battery capacity must be a positive number")
    private Double batteryCapacity;

    @Size(max = 30, message = "Connector type must be at most 30 characters")
    private String connectorType;

    public VehicleRequest() {
    }

    public VehicleRequest(String vehicleName, String vehicleModel, String registrationNumber,
                          Double batteryCapacity, String connectorType) {
        this.vehicleName = vehicleName;
        this.vehicleModel = vehicleModel;
        this.registrationNumber = registrationNumber;
        this.batteryCapacity = batteryCapacity;
        this.connectorType = connectorType;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    public String getVehicleModel() {
        return vehicleModel;
    }

    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public Double getBatteryCapacity() {
        return batteryCapacity;
    }

    public void setBatteryCapacity(Double batteryCapacity) {
        this.batteryCapacity = batteryCapacity;
    }

    public String getConnectorType() {
        return connectorType;
    }

    public void setConnectorType(String connectorType) {
        this.connectorType = connectorType;
    }
}
