package com.example.admission.controller;

import com.example.admission.model.AdmissionApplication;
import com.example.admission.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/student")
public class StudentController {

    private final ApplicationService applicationService;

    public StudentController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    /**
     * Returns the logged-in student's profile and their admission application(s).
     * Spring Security guarantees Authentication is non-null here because
     * SecurityConfig requires ROLE_STUDENT for all /student/** paths.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(Authentication authentication) {
        String username = authentication.getName();

        Optional<AdmissionApplication> latestApp = applicationService.getApplicationForUsername(username);
        List<AdmissionApplication> allApps = applicationService.getAllApplicationsForUsername(username);

        String fullName = latestApp.map(AdmissionApplication::getStudentName).orElse(username);

        return ResponseEntity.ok(Map.of(
                "username", username,
                "fullName", fullName,
                "role", "ROLE_STUDENT",
                "hasApplication", latestApp.isPresent(),
                "admissionApp", latestApp.orElse(null),
                "allApplications", allApps
        ));
    }
}
