package com.evchargehub.service;

import com.evchargehub.dto.request.BookingRequest;
import com.evchargehub.dto.response.BookingResponse;
import com.evchargehub.entity.*;
import com.evchargehub.entity.enums.BookingStatus;
import com.evchargehub.entity.enums.ChargerStatus;
import com.evchargehub.entity.enums.StationStatus;
import com.evchargehub.entity.enums.UserRole;
import com.evchargehub.exception.BadRequestException;
import com.evchargehub.exception.BookingConflictException;
import com.evchargehub.exception.ForbiddenException;
import com.evchargehub.repository.BookingRepository;
import com.evchargehub.repository.ChargerRepository;
import com.evchargehub.repository.UserRepository;
import com.evchargehub.repository.VehicleRepository;
import com.evchargehub.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ChargerRepository chargerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User testUser;
    private User testProvider;
    private Station testStation;
    private Charger testCharger;
    private Vehicle testVehicle;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setFullName("Hareen Janith");
        testUser.setEmail("hareen@example.com");
        testUser.setRole(UserRole.ROLE_USER);

        testProvider = new User();
        testProvider.setId(2L);
        testProvider.setFullName("Eng. Kasun Perera");
        testProvider.setEmail("kasun@example.com");
        testProvider.setRole(UserRole.ROLE_OWNER);

        testStation = new Station();
        testStation.setId(10L);
        testStation.setStationName("Galle Supercharger Hub");
        testStation.setAddress("Hapugala, Galle");
        testStation.setCity("Galle");
        testStation.setStatus(StationStatus.ACTIVE);
        testStation.setProvider(testProvider);

        testCharger = new Charger();
        testCharger.setId(100L);
        testCharger.setChargerName("Bay 01 - DC Fast 150kW");
        testCharger.setChargerType("CCS");
        testCharger.setChargingPower(BigDecimal.valueOf(150.0));
        testCharger.setPricePerKwh(BigDecimal.valueOf(85.0));
        testCharger.setStatus(ChargerStatus.AVAILABLE);
        testCharger.setStation(testStation);

        testVehicle = new Vehicle();
        testVehicle.setId(50L);
        testVehicle.setUser(testUser);
        testVehicle.setVehicleName("Tesla Model 3");
    }

    @Test
    @DisplayName("Should create booking successfully when no time slot conflicts exist")
    void testCreateBooking_Success() {
        LocalDate date = LocalDate.now().plusDays(1);
        LocalTime start = LocalTime.of(10, 0);
        LocalTime end = LocalTime.of(11, 0);

        BookingRequest request = new BookingRequest(
                100L, 50L, date, start, end, 60, BigDecimal.valueOf(30.0)
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(chargerRepository.findById(100L)).thenReturn(Optional.of(testCharger));
        when(bookingRepository.findOverlappingBookings(100L, date, start, end)).thenReturn(Collections.emptyList());
        when(vehicleRepository.findByIdAndUserId(50L, 1L)).thenReturn(Optional.of(testVehicle));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(1001L);
            return b;
        });

        BookingResponse response = bookingService.createBooking(1L, request);

        assertNotNull(response);
        assertEquals(1L, response.getUserId());
        assertEquals(100L, response.getChargerId());
        assertEquals("Bay 01 - DC Fast 150kW", response.getChargerName());
        assertEquals(BookingStatus.CONFIRMED, response.getStatus());
        assertEquals(60, response.getDurationMinutes());
        // Price = 30 kWh * 85 LKR = 2550.00 LKR
        assertEquals(new BigDecimal("2550.00"), response.getTotalPrice());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should throw BookingConflictException when requested time overlaps with existing booking")
    void testCreateBooking_ThrowsConflictException_WhenSlotOverlaps() {
        LocalDate date = LocalDate.now().plusDays(1);
        LocalTime start = LocalTime.of(10, 30);
        LocalTime end = LocalTime.of(11, 30);

        Booking existingBooking = new Booking();
        existingBooking.setId(200L);
        existingBooking.setStartTime(LocalTime.of(10, 0));
        existingBooking.setEndTime(LocalTime.of(11, 0));
        existingBooking.setBookingStatus(BookingStatus.CONFIRMED);

        BookingRequest request = new BookingRequest(
                100L, null, date, start, end, null, null
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(chargerRepository.findById(100L)).thenReturn(Optional.of(testCharger));
        when(bookingRepository.findOverlappingBookings(100L, date, start, end))
                .thenReturn(List.of(existingBooking));

        BookingConflictException ex = assertThrows(BookingConflictException.class, () ->
                bookingService.createBooking(1L, request)
        );

        assertTrue(ex.getMessage().contains("already booked"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when end time is before or equal to start time")
    void testCreateBooking_ThrowsIllegalArgumentException_WhenStartTimeAfterEndTime() {
        LocalDate date = LocalDate.now().plusDays(1);
        BookingRequest request = new BookingRequest(
                100L, null, date, LocalTime.of(12, 0), LocalTime.of(11, 0), null, null
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                bookingService.createBooking(1L, request)
        );

        assertTrue(ex.getMessage().contains("must be after start time"));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when booking date is in the past")
    void testCreateBooking_ThrowsIllegalArgumentException_WhenDateInPast() {
        LocalDate pastDate = LocalDate.now().minusDays(1);
        BookingRequest request = new BookingRequest(
                100L, null, pastDate, LocalTime.of(10, 0), LocalTime.of(11, 0), null, null
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                bookingService.createBooking(1L, request)
        );

        assertTrue(ex.getMessage().contains("cannot be in the past"));
    }

    @Test
    @DisplayName("Should throw BadRequestException when charger is OFFLINE")
    void testCreateBooking_ThrowsBadRequestException_WhenChargerOffline() {
        testCharger.setStatus(ChargerStatus.OFFLINE);
        LocalDate date = LocalDate.now().plusDays(1);
        BookingRequest request = new BookingRequest(
                100L, null, date, LocalTime.of(10, 0), LocalTime.of(11, 0), null, null
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(chargerRepository.findById(100L)).thenReturn(Optional.of(testCharger));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                bookingService.createBooking(1L, request)
        );

        assertTrue(ex.getMessage().contains("not available"));
    }

    @Test
    @DisplayName("Should cancel booking successfully")
    void testCancelBooking_Success() {
        Booking booking = new Booking();
        booking.setId(500L);
        booking.setUser(testUser);
        booking.setCharger(testCharger);
        booking.setBookingStatus(BookingStatus.CONFIRMED);

        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.cancelBooking(1L, 500L);

        assertEquals(BookingStatus.CANCELLED, response.getStatus());
        assertNotNull(response.getCancelledAt());
        verify(bookingRepository, times(1)).save(booking);
    }

    @Test
    @DisplayName("Should throw BadRequestException when cancelling already cancelled booking")
    void testCancelBooking_AlreadyCancelled() {
        Booking booking = new Booking();
        booking.setId(500L);
        booking.setUser(testUser);
        booking.setCharger(testCharger);
        booking.setBookingStatus(BookingStatus.CANCELLED);

        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                bookingService.cancelBooking(1L, 500L)
        );

        assertTrue(ex.getMessage().contains("already been cancelled"));
    }

    @Test
    @DisplayName("Should throw ForbiddenException when user cancels someone else's booking")
    void testCancelBooking_ForbiddenUser() {
        Booking booking = new Booking();
        booking.setId(500L);
        booking.setUser(testUser); // Owned by user ID 1
        booking.setCharger(testCharger);
        booking.setBookingStatus(BookingStatus.CONFIRMED);

        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));

        assertThrows(ForbiddenException.class, () ->
                bookingService.cancelBooking(999L, 500L) // Stranger ID 999
        );
    }
}

