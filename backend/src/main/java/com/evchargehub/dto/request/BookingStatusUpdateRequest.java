package com.evchargehub.dto.request;

import com.evchargehub.entity.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for provider updating booking status.
 */
public class BookingStatusUpdateRequest {

    @NotNull(message = "Booking status is required")
    private BookingStatus status;

    public BookingStatusUpdateRequest() {
    }

    public BookingStatusUpdateRequest(BookingStatus status) {
        this.status = status;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }
}
