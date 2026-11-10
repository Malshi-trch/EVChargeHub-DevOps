package com.evchargehub.dto.response;

import com.evchargehub.entity.User;
import com.evchargehub.entity.enums.UserRole;

import java.time.LocalDateTime;

/**
 * Safe user response DTO.
 * Explicitly excludes password and sensitive authentication credentials.
 */
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private UserRole role;
    private String companyName;
    private String businessAddress;
    private String profilePicture;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    public UserResponse() {
    }

    public UserResponse(Long id, String fullName, String email, String phoneNumber, UserRole role,
                        String companyName, String businessAddress, String profilePicture,
                        LocalDateTime createdAt, LocalDateTime lastLoginAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.companyName = companyName;
        this.businessAddress = businessAddress;
        this.profilePicture = profilePicture;
        this.createdAt = createdAt;
        this.lastLoginAt = lastLoginAt;
    }

    public static UserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole(),
                user.getCompanyName(),
                user.getBusinessAddress(),
                user.getProfilePicture(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getBusinessAddress() {
        return businessAddress;
    }

    public void setBusinessAddress(String businessAddress) {
        this.businessAddress = businessAddress;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
}
