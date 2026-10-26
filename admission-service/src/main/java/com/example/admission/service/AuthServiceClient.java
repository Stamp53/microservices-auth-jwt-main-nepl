package com.example.admission.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceClient.class);

    private final RestTemplate restTemplate;

    @Value("${auth.service.url:http://AUTH-SERVICE}")
    private String authServiceBaseUrl;

    public AuthServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // 1. Create a student login account in Auth Service
    public void registerStudent(String username, String password, String email, String fullName) {
        String url = authServiceBaseUrl + "/auth/register";

        Map<String, String> request = new HashMap<>();
        request.put("username", username);
        request.put("password", password);
        request.put("email", email);
        request.put("fullName", fullName);
        request.put("role", "ROLE_STUDENT");

        try {
            restTemplate.postForEntity(url, request, String.class);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to register user in Auth Service: " + ex.getMessage());
        }
    }

    // 2. Undo / Delete the student login account if local admission fails
    public void rollbackUser(String username) {
        try {
            restTemplate.delete(authServiceBaseUrl + "/auth/internal/users/" + username);
        } catch (Exception ex) {
            logger.error("Failed to delete user '{}' from Auth Service: {}", username, ex.getMessage());
        }
    }
}



