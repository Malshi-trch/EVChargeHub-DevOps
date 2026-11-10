package com.evchargehub.repository;

import com.evchargehub.entity.Charger;
import com.evchargehub.entity.enums.ChargerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for the CHARGERS table.
 *
 * Provides CRUD operations for individual charging points (bays) at stations.
 * Each charger belongs to one station (station_id foreign key).
 */
@Repository
public interface ChargerRepository extends JpaRepository<Charger, Long> {

    /**
     * Find all chargers at a specific station.
     * Used on the Station Details page to show available charging bays.
     *
     * Example: findByStationId(1L) → [Bay 01, Bay 02, Bay 03, ...]
     * SQL generated: SELECT * FROM chargers WHERE station_id = ?
     */
    List<Charger> findByStationId(Long stationId);

    /**
     * Find a charger by its ID and station ID.
     * Used to verify the charger actually belongs to the station
     * before updating or deleting it.
     *
     * SQL generated: SELECT * FROM chargers WHERE id = ? AND station_id = ?
     */
    Optional<Charger> findByIdAndStationId(Long id, Long stationId);

    /**
     * Find all chargers with a specific status at a station.
     * Used to show only available chargers when booking.
     *
     * Example: findByStationIdAndStatus(1L, ChargerStatus.AVAILABLE)
     * SQL generated: SELECT * FROM chargers WHERE station_id = ? AND status = ?
     */
    List<Charger> findByStationIdAndStatus(Long stationId, ChargerStatus status);

    /**
     * Count all chargers at a station.
     * Used on the station card to show "totalChargers".
     *
     * SQL generated: SELECT COUNT(*) FROM chargers WHERE station_id = ?
     */
    Long countByStationId(Long stationId);

    /**
     * Count available chargers at a station.
     * Used on the station card to show "availableChargers".
     *
     * SQL generated: SELECT COUNT(*) FROM chargers WHERE station_id = ? AND status = ?
     */
    Long countByStationIdAndStatus(Long stationId, ChargerStatus status);

    /**
     * Find chargers by connector type at a station.
     * Used when users filter by compatible connector.
     *
     * Example: findByStationIdAndChargerType(1L, "CCS")
     * SQL generated: SELECT * FROM chargers WHERE station_id = ? AND charger_type = ?
     */
    List<Charger> findByStationIdAndChargerType(Long stationId, String chargerType);
}

