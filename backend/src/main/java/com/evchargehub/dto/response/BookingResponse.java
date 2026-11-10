package com.evchargehub.dto.response;

import com.evchargehub.entity.Booking;
import com.evchargehub.entity.enums.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Detailed booking response DTO.
 */
public class BookingResponse {

    private Long id;
    private String bookingId;

    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    private Long vehicleId;
    private String vehicleName;

    private Long stationId;
    private String stationName;
    private String stationAddress;
    private Long chargerId;
    private String chargerName;
    private String connectorType;
    private BigDecimal chargingPower;
    private BigDecimal pricePerKwh;

    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;

    private BigDecimal estimatedEnergy;
    private BigDecimal totalPrice;

    private BookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;

    public BookingResponse() {
    }

    public BookingResponse(Long id, String bookingId, Long userId, String customerName,
                           String customerEmail, String customerPhone, Long vehicleId,
                           String vehicleName, Long stationId, String stationName,
                           String stationAddress, Long chargerId, String chargerName,
                           String connectorType, BigDecimal chargingPower, BigDecimal pricePerKwh,
                           LocalDate bookingDate, LocalTime startTime, LocalTime endTime,
                           Integer durationMinutes, BigDecimal estimatedEnergy, BigDecimal totalPrice,
                           BookingStatus status, LocalDateTime createdAt, LocalDateTime confirmedAt,
                           LocalDateTime startedAt, LocalDateTime completedAt, LocalDateTime cancelledAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.userId = userId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.stationId = stationId;
        this.stationName = stationName;
        this.stationAddress = stationAddress;
        this.chargerId = chargerId;
        this.chargerName = chargerName;
        this.connectorType = connectorType;
        this.chargingPower = chargingPower;
        this.pricePerKwh = pricePerKwh;
        this.bookingDate = bookingDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.estimatedEnergy = estimatedEnergy;
        this.totalPrice = totalPrice;
        this.status = status;
        this.createdAt = createdAt;
        this.confirmedAt = confirmedAt;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.cancelledAt = cancelledAt;
    }

    public static BookingResponse fromEntity(Booking booking) {
        if (booking == null) {
            return null;
        }

        return new BookingResponse(
                booking.getId(),
                booking.getBookingId(),
                booking.getUser() != null ? booking.getUser().getId() : null,
                booking.getUser() != null ? booking.getUser().getFullName() : null,
                booking.getUser() != null ? booking.getUser().getEmail() : null,
                booking.getUser() != null ? booking.getUser().getPhoneNumber() : null,
                booking.getVehicle() != null ? booking.getVehicle().getId() : null,
                booking.getVehicle() != null ? booking.getVehicle().getVehicleName() : null,
                booking.getCharger() != null && booking.getCharger().getStation() != null ? booking.getCharger().getStation().getId() : null,
                booking.getCharger() != null && booking.getCharger().getStation() != null ? booking.getCharger().getStation().getStationName() : null,
                booking.getCharger() != null && booking.getCharger().getStation() != null ? booking.getCharger().getStation().getAddress() : null,
                booking.getCharger() != null ? booking.getCharger().getId() : null,
                booking.getCharger() != null ? booking.getCharger().getChargerName() : null,
                booking.getCharger() != null ? booking.getCharger().getChargerType() : null,
                booking.getCharger() != null ? booking.getCharger().getChargingPower() : null,
                booking.getCharger() != null ? booking.getCharger().getPricePerKwh() : null,
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getDurationMinutes(),
                booking.getEstimatedEnergy(),
                booking.getTotalPrice(),
                booking.getBookingStatus(),
                booking.getCreatedAt(),
                booking.getConfirmedAt(),
                booking.getStartedAt(),
                booking.getCompletedAt(),
                booking.getCancelledAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
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

    public String getStationAddress() {
        return stationAddress;
    }

    public void setStationAddress(String stationAddress) {
        this.stationAddress = stationAddress;
    }

    public Long getChargerId() {
        return chargerId;
    }

    public void setChargerId(Long chargerId) {
        this.chargerId = chargerId;
    }

    public String getChargerName() {
        return chargerName;
    }

    public void setChargerName(String chargerName) {
        this.chargerName = chargerName;
    }

    public String getConnectorType() {
        return connectorType;
    }

    public void setConnectorType(String connectorType) {
        this.connectorType = connectorType;
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

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }
}
