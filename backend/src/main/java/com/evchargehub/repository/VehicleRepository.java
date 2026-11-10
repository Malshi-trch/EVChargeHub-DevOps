package com.evchargehub.repository;

import com.evchargehub.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for the VEHICLES table.
 *
 * Provides CRUD operations for electric vehicles registered by EV users.
 * Each vehicle belongs to one user (user_id foreign key).
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    /**
     * Find all vehicles belonging to a specific user.
     * Used on the "My Vehicles" page and when selecting a vehicle for booking.
     *
     * Example: findByUserId(1L) → [Tesla Model 3, Nissan Leaf]
     * SQL generated: SELECT * FROM vehicles WHERE user_id = ?
     */
    List<Vehicle> findByUserId(Long userId);

    /**
     * Find a specific vehicle by ID, only if it belongs to the given user.
     * Used to verify ownership before updating or deleting a vehicle.
     *
     * Example: findByIdAndUserId(5L, 1L)
     * SQL generated: SELECT * FROM vehicles WHERE id = ? AND user_id = ?
     */
    Optional<Vehicle> findByIdAndUserId(Long id, Long userId);

    /**
     * Check if a registration number is already in use.
     * Prevents duplicate vehicle registrations.
     *
     * SQL generated: SELECT COUNT(*) > 0 FROM vehicles WHERE registration_number = ?
     */
    Boolean existsByRegistrationNumber(String registrationNumber);
}

