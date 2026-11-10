package com.evchargehub.service.impl;

import com.evchargehub.dto.request.VehicleRequest;
import com.evchargehub.dto.response.VehicleResponse;
import com.evchargehub.entity.User;
import com.evchargehub.entity.Vehicle;
import com.evchargehub.exception.BadRequestException;
import com.evchargehub.exception.ForbiddenException;
import com.evchargehub.exception.ResourceNotFoundException;
import com.evchargehub.repository.UserRepository;
import com.evchargehub.repository.VehicleRepository;
import com.evchargehub.service.VehicleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of VehicleService.
 */
@Service
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public VehicleServiceImpl(VehicleRepository vehicleRepository, UserRepository userRepository) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> getMyVehicles(Long userId) {
        return vehicleRepository.findByUserId(userId)
                .stream()
                .map(VehicleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Long userId, Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));
        return VehicleResponse.fromEntity(vehicle);
    }

    @Override
    @Transactional
    public VehicleResponse addVehicle(Long userId, VehicleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getRegistrationNumber() != null && !request.getRegistrationNumber().trim().isEmpty()) {
            if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber().trim())) {
                throw new BadRequestException("A vehicle with registration number '" + request.getRegistrationNumber() + "' is already registered.");
            }
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setUser(user);
        vehicle.setVehicleName(request.getVehicleName().trim());
        vehicle.setVehicleModel(request.getVehicleModel().trim());
        vehicle.setRegistrationNumber(request.getRegistrationNumber() != null ? request.getRegistrationNumber().trim() : null);
        vehicle.setBatteryCapacity(request.getBatteryCapacity());
        vehicle.setConnectorType(request.getConnectorType());

        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(savedVehicle);
    }

    @Override
    @Transactional
    public VehicleResponse updateVehicle(Long userId, Long vehicleId, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to modify this vehicle.");
        }

        vehicle.setVehicleName(request.getVehicleName().trim());
        vehicle.setVehicleModel(request.getVehicleModel().trim());
        vehicle.setRegistrationNumber(request.getRegistrationNumber() != null ? request.getRegistrationNumber().trim() : null);
        vehicle.setBatteryCapacity(request.getBatteryCapacity());
        vehicle.setConnectorType(request.getConnectorType());

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(updatedVehicle);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long userId, Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        if (!vehicle.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to delete this vehicle.");
        }

        vehicleRepository.delete(vehicle);
    }
}
