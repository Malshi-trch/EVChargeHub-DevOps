package com.evchargehub.controller;

import com.evchargehub.dto.request.StationRequest;
import com.evchargehub.dto.response.StationResponse;
import com.evchargehub.exception.GlobalExceptionHandler;
import com.evchargehub.exception.ResourceNotFoundException;
import com.evchargehub.service.StationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class StationControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private StationService stationService;

    @InjectMocks
    private StationController stationController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(stationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/stations should return list of active stations")
    void testGetStations_Success() throws Exception {
        StationResponse s1 = new StationResponse();
        s1.setId(1L);
        s1.setStationName("Colombo Station");

        when(stationService.getAllActiveStations()).thenReturn(List.of(s1));

        mockMvc.perform(get("/api/stations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stationName").value("Colombo Station"));
    }

    @Test
    @DisplayName("GET /api/stations?keyword=galle should call search")
    void testSearchStations_Success() throws Exception {
        StationResponse s1 = new StationResponse();
        s1.setId(2L);
        s1.setStationName("Galle Hub");

        when(stationService.searchStations("galle")).thenReturn(List.of(s1));

        mockMvc.perform(get("/api/stations?keyword=galle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stationName").value("Galle Hub"));
    }

    @Test
    @DisplayName("GET /api/stations/{id} should return 404 when station does not exist")
    void testGetStationById_NotFound() throws Exception {
        when(stationService.getStationById(99L))
                .thenThrow(new ResourceNotFoundException("Station", "id", 99L));

        mockMvc.perform(get("/api/stations/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Station not found with id: '99'"));
    }

    @Test
    @DisplayName("POST /api/stations should return 201 Created")
    void testCreateStation_Success() throws Exception {
        StationRequest request = new StationRequest();
        request.setStationName("Kandy Central Hub");
        request.setAddress("Peradeniya Road");
        request.setCity("Kandy");
        request.setLatitude(7.2906);
        request.setLongitude(80.6337);

        StationResponse response = new StationResponse();
        response.setId(3L);
        response.setStationName("Kandy Central Hub");

        when(stationService.createStation(eq(10L), any(StationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/stations")
                        .header("X-User-Id", 10L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3L))
                .andExpect(jsonPath("$.stationName").value("Kandy Central Hub"));
    }

    @Test
    @DisplayName("DELETE /api/stations/{id} should return 204 No Content")
    void testDeleteStation_Success() throws Exception {
        doNothing().when(stationService).deleteStation(10L, 5L);

        mockMvc.perform(delete("/api/stations/5")
                        .header("X-User-Id", 10L))
                .andExpect(status().isNoContent());
    }
}

