package com.evchargehub.repository;

import com.evchargehub.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for the FACILITIES table.
 *
 * Provides CRUD operations for station amenities (Wi-Fi, Restroom, Cafe, etc.).
 * Each facility belongs to one station (station_id foreign key).
 */
@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {

    /**
     * Find all facilities at a specific station.
     * Used on the Station Details page to show available amenities.
     *
     * Example: findByStationId(1L) → ["Restroom", "Parking", "Wi-Fi", "Cafe"]
     * SQL generated: SELECT * FROM facilities WHERE station_id = ?
     */
    List<Facility> findByStationId(Long stationId);

    /**
     * Delete all facilities for a station.
     * Used when updating a station's facilities — delete all, then re-insert.
     * This is simpler than tracking individual adds/removes.
     *
     * SQL generated: DELETE FROM facilities WHERE station_id = ?
     */
    void deleteByStationId(Long stationId);
}

