/**
 * Charger Service for EVChargeHub.
 * Connects frontend with Spring Boot /api/chargers and /api/stations/{stationId}/chargers endpoints.
 */

import api from "./api";

export const chargerService = {
  /**
   * Get all chargers, optionally filtered by stationId
   */
  async getAllChargers(stationId = null) {
    const query = stationId ? `?stationId=${stationId}` : "";
    return await api.get(`/api/chargers${query}`);
  },

  /**
   * Get chargers belonging to a specific station
   */
  async getChargersByStation(stationId) {
    return await api.get(`/api/stations/${stationId}/chargers`);
  },

  /**
   * Get charger details by ID
   */
  async getChargerById(id) {
    return await api.get(`/api/chargers/${id}`);
  },

  /**
   * Create a new charger for a station (Provider / Admin)
   */
  async createCharger(stationId, chargerData) {
    return await api.post(`/api/stations/${stationId}/chargers`, chargerData);
  },

  /**
   * Update charger details
   */
  async updateCharger(id, chargerData) {
    return await api.put(`/api/chargers/${id}`, chargerData);
  },

  /**
   * Update charger operational status (AVAILABLE, IN_USE, OFFLINE, MAINTENANCE)
   */
  async updateChargerStatus(id, status) {
    return await api.patch(`/api/chargers/${id}/status?status=${encodeURIComponent(status)}`);
  },

  /**
   * Delete a charger
   */
  async deleteCharger(id) {
    return await api.delete(`/api/chargers/${id}`);
  },
};

export default chargerService;

