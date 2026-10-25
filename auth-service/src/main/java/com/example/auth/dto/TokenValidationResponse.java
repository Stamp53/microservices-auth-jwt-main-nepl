package com.example.auth.dto;

import com.example.auth.model.Role;

public class TokenValidationResponse {

    private boolean valid;
    private String username;
    private Role role;
    private String email;
    private String message;

    public TokenValidationResponse() {
    }

    public TokenValidationResponse(boolean valid, String username, Role role, String email, String message) {
        this.valid = valid;
        this.username = username;
        this.role = role;
        this.email = email;
        this.message = message;
    }

    public static TokenValidationResponse valid(String username, Role role, String email) {
        return new TokenValidationResponse(true, username, role, email, "Token is valid");
    }

    public static TokenValidationResponse invalid(String message) {
        return new TokenValidationResponse(false, null, null, null, message);
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
