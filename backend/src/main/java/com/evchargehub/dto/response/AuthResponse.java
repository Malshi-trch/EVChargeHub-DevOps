package com.evchargehub.dto.response;

/**
 * Authentication response containing user details and optional token.
 */
public class AuthResponse {

    private boolean success;
    private String token;
    private String tokenType;
    private UserResponse user;
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(boolean success, String token, String tokenType, UserResponse user, String message) {
        this.success = success;
        this.token = token;
        this.tokenType = tokenType;
        this.user = user;
        this.message = message;
    }

    public static AuthResponse of(boolean success, String message, UserResponse user) {
        return new AuthResponse(success, null, null, user, message);
    }

    public static AuthResponse of(boolean success, String message, UserResponse user, String token) {
        return new AuthResponse(success, token, "Bearer", user, message);
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
