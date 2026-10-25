package com.example.admission.controller;

import com.example.admission.dto.AdminStudentRegistrationDto;
import com.example.admission.dto.ApprovalDto;
import com.example.admission.dto.RejectionDto;
import com.example.admission.model.AdmissionApplication;
import com.example.admission.model.ApplicationStatus;
import com.example.admission.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final ApplicationService applicationService;

    public AdminController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(@RequestParam(value = "page", defaultValue = "0") int page,
                                       @RequestParam(value = "size", defaultValue = "5") int size) {
        if (page < 0) page = 0;
        if (size <= 0) size = 5;
        Page<AdmissionApplication> applicationPage = applicationService.getApplicationsPaged(page, size);

        Map<String, Object> data = new HashMap<>();
        data.put("totalCount", applicationService.countTotal());
        data.put("pendingCount", applicationService.countPending());
        data.put("approvedCount", applicationService.countApproved());
        data.put("rejectedCount", applicationService.countRejected());
        data.put("recentApplications", applicationPage.getContent());
        data.put("currentPage", page);
        data.put("totalPages", applicationPage.getTotalPages());
        data.put("totalItems", applicationPage.getTotalElements());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/applications")
    public ResponseEntity<List<AdmissionApplication>> listApplications(
            @RequestParam(value = "status", required = false, defaultValue = "ALL") String status) {
        List<AdmissionApplication> applications;
        if ("PENDING".equalsIgnoreCase(status)) {
            applications = applicationService.getApplicationsByStatus(ApplicationStatus.PENDING);
        } else if ("APPROVED".equalsIgnoreCase(status)) {
            applications = applicationService.getApplicationsByStatus(ApplicationStatus.APPROVED);
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            applications = applicationService.getApplicationsByStatus(ApplicationStatus.REJECTED);
        } else {
            applications = applicationService.getAllApplications();
        }

        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<?> viewApplication(@PathVariable Long id) {
        Optional<AdmissionApplication> appOpt = applicationService.findById(id);
        if (appOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Invalid application ID: " + id));
        }
        return ResponseEntity.ok(appOpt.get());
    }

    @PostMapping("/applications/{id}/approve")
    public ResponseEntity<?> approveApplication(@PathVariable Long id,
                                               @RequestBody(required = false) ApprovalDto approvalDto) {
        try {
            if (approvalDto == null) {
                approvalDto = new ApprovalDto("AUTO", "AUTO", "Approved");
            }
            AdmissionApplication app = applicationService.approveApplication(id, approvalDto);
            return ResponseEntity.ok(app);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/applications/{id}/reject")
    public ResponseEntity<?> rejectApplication(@PathVariable Long id,
                                              @RequestBody(required = false) RejectionDto rejectionDto) {
        try {
            if (rejectionDto == null) {
                rejectionDto = new RejectionDto("Rejected");
            }
            AdmissionApplication app = applicationService.rejectApplication(id, rejectionDto);
            return ResponseEntity.ok(app);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/register-student")
    public ResponseEntity<?> handleAdminRegisterStudent(@Valid @RequestBody AdminStudentRegistrationDto dto) {
        try {
            AdmissionApplication created = applicationService.adminRegisterStudent(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/reports")
    public ResponseEntity<?> classSectionReports(@RequestParam(value = "className", required = false) String className,
                                                 @RequestParam(value = "section", required = false) String section) {
        List<AdmissionApplication> reportStudents = applicationService.getReport(className, section);
        Map<String, Object> data = new HashMap<>();
        data.put("students", reportStudents);
        data.put("selectedClass", className);
        data.put("selectedSection", section);
        data.put("availableClasses", applicationService.getAvailableClasses());
        data.put("availableSections", applicationService.getAvailableSections());
        data.put("totalEnrolled", reportStudents.size());
        return ResponseEntity.ok(data);
    }
}
