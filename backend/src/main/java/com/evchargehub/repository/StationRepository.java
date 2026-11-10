package com.evchargehub.repository;

import com.evchargehub.entity.Station;
import com.evchargehub.entity.enums.StationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for the STATIONS table.
 *
 * Provides CRUD and search operations for EV charging stations.
 * Stations are owned by providers (users with ROLE_OWNER).
 */
@Repository
public interface StationRepository extends JpaRepository<Station, Long> {

    /**
     * Find all stations owned by a specific provider.
     * Used on the Owner's "My Stations" page.
     *
     * Example: findByProviderId(2L) → all stations owned by provider #2
     * SQL generated: SELECT * FROM stations WHERE provider_id = ?
     */
    List<Station> findByProviderId(Long providerId);

    /**
     * Find a station by ID, only if it belongs to the given provider.
     * Used to verify ownership before updating or deleting.
     *
     * SQL generated: SELECT * FROM stations WHERE id = ? AND provider_id = ?
     */
    Optional<Station> findByIdAndProviderId(Long id, Long providerId);

    /**
     * Find all stations with a specific status.
     * Used to show only active stations to EV users.
     *
     * Example: findByStatus(StationStatus.ACTIVE)
     * SQL generated: SELECT * FROM stations WHERE status = ?
     */
    List<Station> findByStatus(StationStatus status);

    /**
     * Search stations by name (case-insensitive, partial match).
     * Used by the "Find Stations" search bar.
     *
     * Example: findByStationNameContainingIgnoreCase("Ruhuna")
     *   → finds "University of Ruhuna Charging Station"
     *
     * SQL generated: SELECT * FROM stations WHERE LOWER(station_name) LIKE LOWER('%?%')
     */
    List<Station> findByStationNameContainingIgnoreCase(String stationName);

    /**
     * Search stations by city (case-insensitive, partial match).
     * Used when users filter by location.
     *
     * Example: findByCityContainingIgnoreCase("galle")
     * SQL generated: SELECT * FROM stations WHERE LOWER(city) LIKE LOWER('%?%')
     */
    List<Station> findByCityContainingIgnoreCase(String city);

    /**
     * Search stations by name OR city (case-insensitive).
     * Combines name and location search into a single query.
     * Used by the frontend search bar which searches both fields.
     *
     * Example: searchByNameOrCity("galle")
     *   → finds stations named "...Galle..." OR located in "Galle"
     *
     * The @Query annotation lets us write custom JPQL (Java Persistence Query Language).
     * JPQL uses entity class names (Station) not table names (stations).
     */
    @Query("SELECT s FROM Station s WHERE " +
           "LOWER(s.stationName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Station> searchByKeyword(@Param("keyword") String keyword);

    /**
     * Find all active stations, ordered by creation date (newest first).
     * Used to display the station list on the public "Find Stations" page.
     *
     * SQL generated: SELECT * FROM stations WHERE status = ? ORDER BY created_at DESC
     */
    List<Station> findByStatusOrderByCreatedAtDesc(StationStatus status);

    /**
     * Count how many stations a provider owns.
     * Used on the Owner Dashboard.
     *
     * SQL generated: SELECT COUNT(*) FROM stations WHERE provider_id = ?
     */
    Long countByProviderId(Long providerId);
}

