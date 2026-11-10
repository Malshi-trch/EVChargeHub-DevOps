package com.evchargehub.service;

import com.evchargehub.dto.request.StationRequest;
import com.evchargehub.dto.response.StationResponse;
import com.evchargehub.entity.Station;
import com.evchargehub.entity.User;
import com.evchargehub.entity.enums.UserRole;
import com.evchargehub.exception.ForbiddenException;
import com.evchargehub.exception.ResourceNotFoundException;
import com.evchargehub.repository.StationRepository;
import com.evchargehub.repository.UserRepository;
import com.evchargehub.service.impl.StationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StationServiceTest {

    @Mock
    private StationRepository stationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private StationServiceImpl stationService;

    private User provider;
    private User regularUser;

    @BeforeEach
    void setUp() {
        provider = new User();
        provider.setId(10L);
        provider.setFullName("Kasun Perera");
        provider.setRole(UserRole.ROLE_OWNER);

        regularUser = new User();
        regularUser.setId(20L);
        regularUser.setFullName("Normal EV Driver");
        regularUser.setRole(UserRole.ROLE_USER);
    }

    @Test
    @DisplayName("Provider can create a station successfully")
    void testCreateStation_Success() {
        StationRequest request = new StationRequest();
        request.setStationName("Colombo Rapid Hub");
        request.setAddress("Galle Road, Colombo 03");
        request.setCity("Colombo");
        request.setLatitude(6.9271);
        request.setLongitude(79.8612);
        request.setFacilities(List.of("Wi-Fi", "Restroom"));

        when(userRepository.findById(10L)).thenReturn(Optional.of(provider));
        when(stationRepository.save(any(Station.class))).thenAnswer(invocation -> {
            Station s = invocation.getArgument(0);
            s.setId(1L);
            return s;
        });

        StationResponse response = stationService.createStation(10L, request);

        assertNotNull(response);
        assertEquals("Colombo Rapid Hub", response.getStationName());
        assertEquals("Colombo", response.getCity());
        assertEquals(2, response.getFacilities().size());
        verify(stationRepository, times(1)).save(any(Station.class));
    }

    @Test
    @DisplayName("Non-provider (ROLE_USER) cannot create station")
    void testCreateStation_ThrowsForbiddenException_WhenNotOwner() {
        StationRequest request = new StationRequest();
        request.setStationName("Illegal Hub");
        request.setAddress("Some Road");
        request.setCity("Colombo");
        request.setLatitude(6.9271);
        request.setLongitude(79.8612);

        when(userRepository.findById(20L)).thenReturn(Optional.of(regularUser));

        assertThrows(ForbiddenException.class, () ->
                stationService.createStation(20L, request)
        );

        verify(stationRepository, never()).save(any(Station.class));
    }

    @Test
    @DisplayName("Throws ResourceNotFoundException when station does not exist")
    void testGetStationById_NotFound() {
        when(stationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                stationService.getStationById(999L)
        );
    }
}

