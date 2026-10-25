package com.example.auth.dto;

import com.example.auth.model.Role;

public class AuthResponse {

    private String accessToken;
    private String refreshToken = "";
    private String tokenType = "Bearer";
    private long expiresIn;
    private String username;
    private String email;
    private Role role;

    public AuthResponse() {
    }

    public AuthResponse(String accessToken, long expiresIn, String username, String email, Role role) {
        this.accessToken = accessToken;
        this.refreshToken = "";
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public AuthResponse(String accessToken, String refreshToken, long expiresIn, String username, String email, Role role) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken != null ? refreshToken : "";
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
