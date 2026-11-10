package com.evchargehub.repository;

import com.evchargehub.entity.User;
import com.evchargehub.entity.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for the USERS table.
 *
 * Extends JpaRepository which provides built-in methods:
 *   - save(entity)       : Insert or update a user
 *   - findById(id)       : Find a user by primary key
 *   - findAll()          : Get all users
 *   - deleteById(id)     : Delete a user by primary key
 *   - count()            : Count total users
 *   - existsById(id)     : Check if a user exists
 *
 * The custom methods below are auto-implemented by Spring Data JPA
 * based on the method name (no SQL needed).
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their email address.
     * Used during login to look up the account.
     *
     * Example: findByEmail("user@evchargehub.lk")
     * SQL generated: SELECT * FROM users WHERE email = ?
     *
     * Returns Optional because the email might not exist.
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if an email is already registered.
     * Used during registration to prevent duplicate accounts.
     *
     * Example: existsByEmail("user@evchargehub.lk") → true/false
     * SQL generated: SELECT COUNT(*) > 0 FROM users WHERE email = ?
     */
    Boolean existsByEmail(String email);

    /**
     * Find all users with a specific role.
     * Useful for admin features or listing all providers.
     *
     * Example: findByRole(UserRole.ROLE_OWNER) → list of all station providers
     * SQL generated: SELECT * FROM users WHERE role = ?
     */
    List<User> findByRole(UserRole role);

    /**
     * Find a user by email (case-insensitive).
     * Handles cases where users type "User@EVChargeHub.lk" vs "user@evchargehub.lk".
     *
     * SQL generated: SELECT * FROM users WHERE LOWER(email) = LOWER(?)
     */
    Optional<User> findByEmailIgnoreCase(String email);
}

