package com.example.admission.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Service-to-service REST client communicating with AUTH-SERVICE.
 * Supports Saga orchestration and compensating rollback actions.
 */
@Service
public class AuthServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceClient.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${auth.service.url:http://AUTH-SERVICE}")
    private String authServiceBaseUrl;

    public AuthServiceClient(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Saga Action: Calls AUTH-SERVICE to register student credentials.
     * Throws IllegalArgumentException on client/business validation errors (e.g. duplicate username/email).
     * Throws IllegalStateException if AUTH-SERVICE is unreachable.
     */
    public void registerStudent(String username, String password, String email, String fullName) {
        String url = authServiceBaseUrl + "/auth/register";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("username", username);
        body.put("password", password);
        body.put("email", email);
        body.put("fullName", fullName);
        body.put("role", "ROLE_STUDENT");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            logger.info("Saga Step 1: Requesting user registration in AUTH-SERVICE for username '{}'", username);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Saga Step 1 Success: User '{}' created successfully in AUTH-SERVICE", username);
            }
        } catch (HttpStatusCodeException ex) {
            String errorMsg = extractErrorMessage(ex.getResponseBodyAsString(), "Failed to create user in Auth Service (" + ex.getStatusCode() + ")");
            logger.warn("Saga Step 1 Failed: AUTH-SERVICE rejected user registration for '{}': {}", username, errorMsg);
            throw new IllegalArgumentException(errorMsg);
        } catch (ResourceAccessException ex) {
            logger.error("Saga Step 1 Failed: AUTH-SERVICE is unreachable: {}", ex.getMessage());
            throw new IllegalStateException("Authentication service is currently unreachable. Please ensure all microservices are running.");
        } catch (Exception ex) {
            logger.error("Saga Step 1 Failed: Unexpected error communicating with AUTH-SERVICE: {}", ex.getMessage());
            throw new IllegalStateException("Authentication service error: " + ex.getMessage());
        }
    }

    /**
     * Saga Compensating Transaction: Rolls back / deletes the created user in AUTH-SERVICE
     * if the downstream local transaction in ADMISSION-SERVICE fails.
     */
    public void rollbackUser(String username) {
        String url = authServiceBaseUrl + "/auth/internal/users/" + username;
        try {
            logger.warn("Saga Compensating Rollback: Sending DELETE request to AUTH-SERVICE for user '{}'", username);
            restTemplate.delete(url);
            logger.info("Saga Compensating Rollback Success: User '{}' deleted from AUTH-SERVICE", username);
        } catch (Exception ex) {
            logger.error("Saga Compensating Rollback Failed: Could not delete user '{}' from AUTH-SERVICE: {}", username, ex.getMessage(), ex);
        }
    }

    private String extractErrorMessage(String responseBody, String defaultMsg) {
        if (responseBody == null || responseBody.isBlank()) {
            return defaultMsg;
        }
        try {
            JsonNode node = objectMapper.readTree(responseBody);
            if (node.has("message") && !node.get("message").asText().isBlank()) {
                return node.get("message").asText();
            }
            if (node.has("error") && !node.get("error").asText().isBlank()) {
                return node.get("error").asText();
            }
        } catch (Exception ignored) {
        }
        return responseBody;
    }
}
