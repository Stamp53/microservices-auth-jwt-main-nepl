package com.example.admission.controller;

import com.example.admission.dto.StudentRegistrationDto;
import com.example.admission.model.AdmissionApplication;
import com.example.admission.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Public controller for student admission applications:
 * - Submitting new admission applications (/register)
 * - Tracking application status by application number (/track)
 */
@RestController
public class AdmissionRegistrationController {

    private final ApplicationService applicationService;

    public AdmissionRegistrationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    /**
     * Public endpoint — any applicant (or logged-in student) can submit an admission application.
     */
    @PostMapping("/register")
    public ResponseEntity<?> handleRegistration(@Valid @RequestBody StudentRegistrationDto dto,
                                                Authentication authentication) {
        try {
            if ((dto.getUsername() == null || dto.getUsername().isBlank()) && authentication != null && authentication.isAuthenticated()) {
                dto.setUsername(authentication.getName());
            }
            AdmissionApplication createdApp = applicationService.registerStudentApplication(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "message", "Application submitted successfully!",
                    "applicationNumber", createdApp.getApplicationNumber()
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Public endpoint — anyone can track their application status by application number.
     */
    @GetMapping("/track")
    public ResponseEntity<?> trackApplication(@RequestParam String appNum) {
        if (appNum == null || appNum.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Application number is required"));
        }
        Optional<AdmissionApplication> appOpt = applicationService.findByApplicationNumber(appNum.trim());
        if (appOpt.isPresent()) {
            return ResponseEntity.ok(appOpt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "No application found with number: " + appNum));
    }
}
