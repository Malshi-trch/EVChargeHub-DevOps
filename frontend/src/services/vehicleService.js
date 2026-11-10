/**
 * Vehicle Management Service for EVChargeHub.
 * Connects frontend with Spring Boot /api/vehicles REST endpoints.
 */

import api from "./api";

export const vehicleService = {
  /**
   * Fetch all electric vehicles belonging to the current user
   */
  async getMyVehicles() {
    return await api.get("/api/vehicles");
  },

  /**
   * Fetch vehicle by ID
   */
  async getVehicleById(id) {
    return await api.get(`/api/vehicles/${id}`);
  },

  /**
   * Register a new vehicle
   * @param {Object} vehicleData - { vehicleName, vehicleModel, registrationNumber, batteryCapacity, connectorType }
   */
  async createVehicle(vehicleData) {
    return await api.post("/api/vehicles", vehicleData);
  },

  /**
   * Update an existing vehicle
   */
  async updateVehicle(id, vehicleData) {
    return await api.put(`/api/vehicles/${id}`, vehicleData);
  },

  /**
   * Delete a registered vehicle
   */
  async deleteVehicle(id) {
    return await api.delete(`/api/vehicles/${id}`);
  },
};

export default vehicleService;

