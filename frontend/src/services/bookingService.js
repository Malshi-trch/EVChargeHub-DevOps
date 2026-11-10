/**
 * Booking Service for EVChargeHub.
 * Connects frontend with Spring Boot /api/bookings and /api/provider/bookings REST endpoints.
 */

import api from "./api";

export const bookingService = {
  /**
   * Create a new booking reservation with conflict check
   * @param {Object} bookingData - { chargerId, vehicleId, bookingDate, startTime, endTime, durationMinutes, estimatedEnergy }
   */
  async createBooking(bookingData) {
    return await api.post("/api/bookings", bookingData);
  },

  /**
   * Fetch bookings for the currently authenticated EV customer
   */
  async getMyBookings() {
    return await api.get("/api/bookings/my-bookings");
  },

  /**
   * Fetch single booking details by ID
   */
  async getBookingById(id) {
    return await api.get(`/api/bookings/${id}`);
  },

  /**
   * Cancel an existing booking
   */
  async cancelBooking(id) {
    return await api.put(`/api/bookings/${id}/cancel`);
  },

  /**
   * Fetch all bookings for stations owned by the authenticated provider
   */
  async getProviderBookings() {
    return await api.get("/api/provider/bookings");
  },

  /**
   * Update booking status (CONFIRMED, ACTIVE, COMPLETED, CANCELLED)
   */
  async updateBookingStatus(id, newStatus) {
    return await api.put(`/api/bookings/${id}/status`, { status: newStatus });
  },
};

export default bookingService;

