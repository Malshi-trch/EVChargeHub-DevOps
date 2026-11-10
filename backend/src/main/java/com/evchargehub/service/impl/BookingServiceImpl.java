package com.evchargehub.service.impl;

import com.evchargehub.dto.request.BookingRequest;
import com.evchargehub.dto.response.BookingResponse;
import com.evchargehub.entity.Booking;
import com.evchargehub.entity.Charger;
import com.evchargehub.entity.User;
import com.evchargehub.entity.Vehicle;
import com.evchargehub.entity.enums.BookingStatus;
import com.evchargehub.entity.enums.ChargerStatus;
import com.evchargehub.entity.enums.StationStatus;
import com.evchargehub.exception.BadRequestException;
import com.evchargehub.exception.BookingConflictException;
import com.evchargehub.exception.ForbiddenException;
import com.evchargehub.exception.ResourceNotFoundException;
import com.evchargehub.repository.BookingRepository;
import com.evchargehub.repository.ChargerRepository;
import com.evchargehub.repository.UserRepository;
import com.evchargehub.repository.VehicleRepository;
import com.evchargehub.service.BookingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of BookingService.
 * Enforces booking conflict checks, duration validation, and pricing rules.
 */
@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ChargerRepository chargerRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    private static final SecureRandom RANDOM = new SecureRandom();

    public BookingServiceImpl(BookingRepository bookingRepository,
                              ChargerRepository chargerRepository,
                              UserRepository userRepository,
                              VehicleRepository vehicleRepository) {
        this.bookingRepository = bookingRepository;
        this.chargerRepository = chargerRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        // 1. Validate booking date
        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Booking date cannot be in the past.");
        }

        // 2. Validate time interval: endTime must be strictly after startTime
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("Booking end time (" + request.getEndTime() +
                    ") must be after start time (" + request.getStartTime() + ").");
        }

        long calculatedDuration = ChronoUnit.MINUTES.between(request.getStartTime(), request.getEndTime());
        if (calculatedDuration < 15) {
            throw new IllegalArgumentException("Minimum booking duration is 15 minutes.");
        }

        // 3. Verify user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 4. Verify charger exists and is available
        Charger charger = chargerRepository.findById(request.getChargerId())
                .orElseThrow(() -> new ResourceNotFoundException("Charger", "id", request.getChargerId()));

        if (charger.getStatus() == ChargerStatus.OFFLINE || charger.getStatus() == ChargerStatus.MAINTENANCE) {
            throw new BadRequestException("The selected charger '" + charger.getChargerName() +
                    "' is currently not available (status: " + charger.getStatus() + ").");
        }

        if (charger.getStation().getStatus() == StationStatus.INACTIVE) {
            throw new BadRequestException("The station '" + charger.getStation().getStationName() +
                    "' is currently inactive.");
        }

        // 5. Booking Slot Conflict Check
        // Queries non-cancelled bookings overlapping with [request.startTime, request.endTime]
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                request.getChargerId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (!overlapping.isEmpty()) {
            Booking conflict = overlapping.get(0);
            throw new BookingConflictException(String.format(
                    "Charger '%s' is already booked on %s between %s and %s. Please select another time slot or charger.",
                    charger.getChargerName(),
                    request.getBookingDate(),
                    conflict.getStartTime(),
                    conflict.getEndTime()
            ));
        }

        // 6. Optional Vehicle validation
        Vehicle vehicle = null;
        if (request.getVehicleId() != null) {
            vehicle = vehicleRepository.findByIdAndUserId(request.getVehicleId(), userId)
                    .orElseThrow(() -> new BadRequestException("Selected vehicle does not belong to you or does not exist."));
        }

        // 7. Calculate energy and price
        int durationMinutes = (int) calculatedDuration;
        BigDecimal estimatedEnergy = request.getEstimatedEnergy();

        if (estimatedEnergy == null || estimatedEnergy.compareTo(BigDecimal.ZERO) <= 0) {
            BigDecimal durationHours = BigDecimal.valueOf(durationMinutes)
                    .divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
            estimatedEnergy = durationHours.multiply(charger.getChargingPower())
                    .setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal totalPrice = estimatedEnergy.multiply(charger.getPricePerKwh())
                .setScale(2, RoundingMode.HALF_UP);

        // 8. Generate a unique human-readable booking ID (e.g., EVH-802101)
        String generatedBookingId = generateUniqueBookingId();

        // 9. Build and persist Booking entity
        Booking booking = new Booking();
        booking.setBookingId(generatedBookingId);
        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setCharger(charger);
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setDurationMinutes(durationMinutes);
        booking.setEstimatedEnergy(estimatedEnergy);
        booking.setTotalPrice(totalPrice);
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        booking.setConfirmedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);
        return BookingResponse.fromEntity(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        boolean isUser = booking.getUser().getId().equals(userId);
        boolean isProvider = booking.getCharger().getStation().getProvider().getId().equals(userId);

        if (!isUser && !isProvider) {
            throw new ForbiddenException("You do not have permission to view this booking.");
        }

        return BookingResponse.fromEntity(booking);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        boolean isUser = booking.getUser().getId().equals(userId);
        boolean isProvider = booking.getCharger().getStation().getProvider().getId().equals(userId);

        if (!isUser && !isProvider) {
            throw new ForbiddenException("You do not have permission to cancel this booking.");
        }

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("This booking has already been cancelled.");
        }

        if (booking.getBookingStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed booking.");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());

        Booking updated = bookingRepository.save(booking);
        return BookingResponse.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getProviderBookings(Long providerId) {
        return bookingRepository.findByProviderId(providerId)
                .stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long providerId, Long bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getCharger().getStation().getProvider().getId().equals(providerId)) {
            throw new ForbiddenException("You can only manage bookings for stations you own.");
        }

        booking.setBookingStatus(newStatus);
        LocalDateTime now = LocalDateTime.now();

        switch (newStatus) {
            case CONFIRMED -> booking.setConfirmedAt(now);
            case ACTIVE -> booking.setStartedAt(now);
            case COMPLETED -> booking.setCompletedAt(now);
            case CANCELLED -> booking.setCancelledAt(now);
            default -> {}
        }

        Booking updated = bookingRepository.save(booking);
        return BookingResponse.fromEntity(updated);
    }

    private String generateUniqueBookingId() {
        for (int i = 0; i < 10; i++) {
            int randomNum = 100000 + RANDOM.nextInt(900000);
            String candidate = "EVH-" + randomNum;
            if (!bookingRepository.existsByBookingId(candidate)) {
                return candidate;
            }
        }
        return "EVH-" + System.currentTimeMillis() % 1000000;
    }
}
