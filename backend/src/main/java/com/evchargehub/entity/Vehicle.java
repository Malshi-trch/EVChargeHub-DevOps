package com.evchargehub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * VEHICLE entity — represents an electric vehicle registered by an EV user.
 */
@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Vehicle name is required")
    @Size(max = 100, message = "Vehicle name must be at most 100 characters")
    @Column(name = "vehicle_name", nullable = false, length = 100)
    private String vehicleName;

    @NotBlank(message = "Vehicle model is required")
    @Size(max = 100, message = "Vehicle model must be at most 100 characters")
    @Column(name = "vehicle_model", nullable = false, length = 100)
    private String vehicleModel;

    @Size(max = 30, message = "Registration number must be at most 30 characters")
    @Column(name = "registration_number", length = 30)
    private String registrationNumber;

    @Column(name = "battery_capacity")
    private Double batteryCapacity;

    @Size(max = 30, message = "Connector type must be at most 30 characters")
    @Column(name = "connector_type", length = 30)
    private String connectorType;

    public Vehicle() {
    }

    public Vehicle(Long id, User user, String vehicleName, String vehicleModel,
                   String registrationNumber, Double batteryCapacity, String connectorType) {
        this.id = id;
        this.user = user;
        this.vehicleName = vehicleName;
        this.vehicleModel = vehicleModel;
        this.registrationNumber = registrationNumber;
        this.batteryCapacity = batteryCapacity;
        this.connectorType = connectorType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
