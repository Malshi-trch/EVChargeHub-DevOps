package com.evchargehub.repository;

import com.evchargehub.entity.Booking;
import com.evchargehub.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for the BOOKINGS table.
 *
 * Provides CRUD and query operations for charging slot reservations.
 * Contains the critical overlap-detection query used to prevent double-bookings.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Find all bookings made by a specific user.
     * Used on the "My Bookings" page. Orders by creation date (newest first).
     *
     * SQL generated: SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC
     */
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find a booking by its human-readable reference (e.g., "EVH-802101").
     * Used when the frontend sends the booking reference string.
     *
     * SQL generated: SELECT * FROM bookings WHERE booking_id = ?
     */
    Optional<Booking> findByBookingId(String bookingId);

    /**
     * Find a booking by primary key, but only if it belongs to the given user.
     * Used to verify ownership before viewing or cancelling.
     *
     * SQL generated: SELECT * FROM bookings WHERE id = ? AND user_id = ?
     */
    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    /**
     * Find all bookings for a specific charger on a specific date.
     * Used to check charger availability before booking.
     *
     * SQL generated: SELECT * FROM bookings WHERE charger_id = ? AND booking_date = ?
     */
    List<Booking> findByChargerIdAndBookingDate(Long chargerId, LocalDate bookingDate);

    /**
     * CRITICAL: Check for overlapping bookings on the same charger.
     *
     * This query prevents double-booking by finding any existing booking
     * that overlaps with the requested time slot.
     *
     * Two time slots overlap when:
     *   existing.startTime < requested.endTime  AND  existing.endTime > requested.startTime
     *
     * We exclude CANCELLED bookings (they should not block new bookings).
     *
     * Example:
     *   Existing booking:  10:00 - 11:00
     *   Requested booking: 10:30 - 11:30  → OVERLAP (blocked)
     *   Requested booking: 11:00 - 12:00  → NO OVERLAP (allowed)
     *   Requested booking: 09:00 - 10:00  → NO OVERLAP (allowed)
     *
     * @param chargerId   The charger to check
     * @param bookingDate The date to check
     * @param startTime   Requested start time
     * @param endTime     Requested end time
     * @return List of conflicting bookings (empty = no conflict, safe to book)
     */
    @Query("SELECT b FROM Booking b WHERE " +
           "b.charger.id = :chargerId AND " +
           "b.bookingDate = :bookingDate AND " +
           "b.bookingStatus <> com.evchargehub.entity.enums.BookingStatus.CANCELLED AND " +
           "b.startTime < :endTime AND " +
           "b.endTime > :startTime")
    List<Booking> findOverlappingBookings(
            @Param("chargerId") Long chargerId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    /**
     * Find all bookings for chargers belonging to a specific station.
     * Used by the station provider to see all bookings at their station.
     *
     * Uses JPQL join: Booking → Charger → Station
     * SQL equivalent: SELECT b.* FROM bookings b
     *                 JOIN chargers c ON b.charger_id = c.id
     *                 WHERE c.station_id = ?
     *                 ORDER BY b.created_at DESC
     */
    @Query("SELECT b FROM Booking b WHERE b.charger.station.id = :stationId " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findByStationId(@Param("stationId") Long stationId);

    /**
     * Find all bookings for all stations owned by a specific provider.
     * Used on the Owner's "Bookings" page to see all bookings across all their stations.
     *
     * Uses JPQL join: Booking → Charger → Station → Provider(User)
     * SQL equivalent: SELECT b.* FROM bookings b
     *                 JOIN chargers c ON b.charger_id = c.id
     *                 JOIN stations s ON c.station_id = s.id
     *                 WHERE s.provider_id = ?
     *                 ORDER BY b.created_at DESC
     */
    @Query("SELECT b FROM Booking b WHERE b.charger.station.provider.id = :providerId " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findByProviderId(@Param("providerId") Long providerId);

    /**
     * Find bookings by user and status.
     * Used to filter bookings on the "My Bookings" page (e.g., show only active).
     *
     * SQL generated: SELECT * FROM bookings WHERE user_id = ? AND booking_status = ?
     */
    List<Booking> findByUserIdAndBookingStatus(Long userId, BookingStatus bookingStatus);

    /**
     * Count bookings by status for a provider's stations.
     * Used on the Owner Dashboard for statistics.
     */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.charger.station.provider.id = :providerId " +
           "AND b.bookingStatus = :status")
    Long countByProviderIdAndStatus(
            @Param("providerId") Long providerId,
            @Param("status") BookingStatus status
    );

    /**
     * Check if a specific booking reference already exists.
     * Used when generating unique booking IDs (e.g., "EVH-802101").
     *
     * SQL generated: SELECT COUNT(*) > 0 FROM bookings WHERE booking_id = ?
     */
    Boolean existsByBookingId(String bookingId);
}

