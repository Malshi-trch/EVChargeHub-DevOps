package com.evchargehub.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request payload for creating a new booking.
 */
public class BookingRequest {

    @NotNull(message = "Charger ID is required")
    private Long chargerId;

    private Long vehicleId;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @Positive(message = "Duration in minutes must be positive")
    private Integer durationMinutes;

    @Positive(message = "Estimated energy must be positive")
    private BigDecimal estimatedEnergy;

    public BookingRequest() {
    }

    public BookingRequest(Long chargerId, Long vehicleId, LocalDate bookingDate,
                          LocalTime startTime, LocalTime endTime, Integer durationMinutes,
                          BigDecimal estimatedEnergy) {
        this.chargerId = chargerId;
        this.vehicleId = vehicleId;
        this.bookingDate = bookingDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.estimatedEnergy = estimatedEnergy;
    }

    public Long getChargerId() {
        return chargerId;
    }

    public void setChargerId(Long chargerId) {
        this.chargerId = chargerId;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public BigDecimal getEstimatedEnergy() {
        return estimatedEnergy;
    }

    public void setEstimatedEnergy(BigDecimal estimatedEnergy) {
        this.estimatedEnergy = estimatedEnergy;
    }
}
