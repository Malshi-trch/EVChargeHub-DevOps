package com.evchargehub.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security configuration for EVChargeHub backend.
 * Configures stateless JWT authentication, role-based endpoint permissions, and CORS.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          JwtAuthenticationEntryPoint authenticationEntryPoint) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for stateless REST API
                .csrf(csrf -> csrf.disable())

                // Configure CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Stateless session management (no server-side HTTP sessions)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Custom 401 Unauthorized entry point
                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(authenticationEntryPoint))

                // Configure endpoint authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Preflight CORS requests are always allowed
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public authentication endpoints
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()

                        // Public station and charger discovery (read-only)
                        .requestMatchers(HttpMethod.GET, "/api/stations", "/api/stations/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/stations/*/chargers").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/chargers", "/api/chargers/*").permitAll()

                        // Station Provider operations (creating/modifying stations & chargers)
                        .requestMatchers(HttpMethod.POST, "/api/stations", "/api/stations/*/chargers").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/stations/*", "/api/chargers/*").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/chargers/*/status").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/stations/*", "/api/chargers/*").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers("/api/stations/provider/**").hasAnyRole("OWNER", "ADMIN")
                        .requestMatchers("/api/provider/bookings/**").hasAnyRole("OWNER", "ADMIN")

                        // EV Driver / Customer operations
                        .requestMatchers("/api/vehicles/**").hasAnyRole("USER", "OWNER", "ADMIN")
                        .requestMatchers("/api/bookings/my-bookings").hasAnyRole("USER", "OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/bookings").hasAnyRole("USER", "OWNER", "ADMIN")
                        .requestMatchers("/api/bookings/**").hasAnyRole("USER", "OWNER", "ADMIN")

                        // Authenticated user profile lookup
                        .requestMatchers("/api/auth/profile/**", "/api/auth/profile").authenticated()

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                );

        // Add JWT authentication filter before standard UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS configuration enabling secure cross-origin communication with the Vite frontend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow frontend development origin
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        // Allowed HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Allowed headers
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-User-Id"));

        // Allow cookies / credentials
        configuration.setAllowCredentials(true);

        // Preflight response cache duration (1 hour)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

