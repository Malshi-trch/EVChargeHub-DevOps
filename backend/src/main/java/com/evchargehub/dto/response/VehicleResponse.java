package com.evchargehub.dto.response;

import com.evchargehub.entity.Vehicle;

/**
 * Response DTO for an electric vehicle.
 */
public class VehicleResponse {

    private Long id;
    private Long userId;
    private String vehicleName;
    private String vehicleModel;
    private String registrationNumber;
    private Double batteryCapacity;
    private String connectorType;

    public VehicleResponse() {
    }

    public VehicleResponse(Long id, Long userId, String vehicleName, String vehicleModel,
                           String registrationNumber, Double batteryCapacity, String connectorType) {
        this.id = id;
        this.userId = userId;
        this.vehicleName = vehicleName;
        this.vehicleModel = vehicleModel;
        this.registrationNumber = registrationNumber;
        this.batteryCapacity = batteryCapacity;
        this.connectorType = connectorType;
    }

    public static VehicleResponse fromEntity(Vehicle vehicle) {
        if (vehicle == null) {
            return null;
        }
        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getUser() != null ? vehicle.getUser().getId() : null,
                vehicle.getVehicleName(),
                vehicle.getVehicleModel(),
                vehicle.getRegistrationNumber(),
                vehicle.getBatteryCapacity(),
                vehicle.getConnectorType()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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
