/**
 * Charging Station Service for EVChargeHub.
 * Connects frontend with Spring Boot /api/stations REST endpoints.
 */

import api from "./api";

export const stationService = {
  /**
   * Fetch all active charging stations or search by keyword
   */
  async getAllStations(keyword = "") {
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : "";
    return await api.get(`/api/stations${query}`);
  },

  /**
   * Fetch charging station by ID
   */
  async getStationById(id) {
    return await api.get(`/api/stations/${id}`);
  },

  /**
   * Fetch stations owned by a specific provider
   */
  async getProviderStations(providerId) {
    return await api.get(`/api/stations/provider/${providerId}`);
  },

  /**
   * Create a new charging station (Provider / Admin)
   */
  async createStation(stationData) {
    return await api.post("/api/stations", stationData);
  },

  /**
   * Update an existing charging station
   */
  async updateStation(id, stationData) {
    return await api.put(`/api/stations/${id}`, stationData);
  },

  /**
   * Delete a charging station
   */
  async deleteStation(id) {
    return await api.delete(`/api/stations/${id}`);
  },
};

export default stationService;

