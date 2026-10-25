package com.example.admission.service;

import com.example.admission.dto.AdminStudentRegistrationDto;
import com.example.admission.dto.ApprovalDto;
import com.example.admission.dto.RejectionDto;
import com.example.admission.dto.StudentRegistrationDto;
import com.example.admission.model.AdmissionApplication;
import com.example.admission.model.ApplicationStatus;
import com.example.admission.repository.AdmissionApplicationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    public static final int MAX_SECTION_CAPACITY = 30;
    private static final String DEFAULT_STUDENT_PASSWORD = "student123";

    private final AdmissionApplicationRepository applicationRepository;
    private final AuthServiceClient authServiceClient;

    public ApplicationService(AdmissionApplicationRepository applicationRepository,
                              AuthServiceClient authServiceClient) {
        this.applicationRepository = applicationRepository;
        this.authServiceClient = authServiceClient;
    }

    public String autoAssignAvailableSection(String assignedClass, Integer academicYear, Long excludeId) {
        for (char c = 'A'; c <= 'Z'; c++) {
            String sectionName = "Section " + c;
            long currentCount = applicationRepository.countApprovedInSection(assignedClass, sectionName, academicYear, excludeId);
            if (currentCount < MAX_SECTION_CAPACITY) {
                return sectionName;
            }
        }
        throw new IllegalStateException("All sections (A through Z) for " + assignedClass 
                + " have reached maximum capacity (" + MAX_SECTION_CAPACITY + " students each).");
    }

    private String resolveAssignedSection(String requestedSection, String assignedClass, Integer academicYear, Long applicationId) {
        if (requestedSection != null && !requestedSection.trim().isEmpty() && !"AUTO".equalsIgnoreCase(requestedSection.trim())) {
            String sec = requestedSection.trim();
            long currentCount = applicationRepository.countApprovedInSection(assignedClass, sec, academicYear, applicationId);
            if (currentCount >= MAX_SECTION_CAPACITY) {
                throw new IllegalStateException(sec + " for " + assignedClass 
                        + " is full (reached maximum capacity of " + MAX_SECTION_CAPACITY + " students). Please choose another section or use auto-assign.");
            }
            return sec;
        }
        return autoAssignAvailableSection(assignedClass, academicYear, applicationId);
    }

    private synchronized String generateNextApplicationNumber() {
        int currentYear = Year.now().getValue();
        long totalCount = applicationRepository.count();
        long nextSeq = 1001 + totalCount;
        String appNum = "APP-" + currentYear + "-" + nextSeq;
        while (applicationRepository.findByApplicationNumber(appNum).isPresent()) {
            nextSeq++;
            appNum = "APP-" + currentYear + "-" + nextSeq;
        }
        return appNum;
    }

    private synchronized String generateNextPermanentRollNumber() {
        int currentYear = Year.now().getValue();
        long approvedCount = applicationRepository.countByStatus(ApplicationStatus.APPROVED);
        long nextSeq = 1 + approvedCount;
        String rollNum = String.format("ADM-%d-%03d", currentYear, nextSeq);
        while (applicationRepository.findByPermanentRollNumber(rollNum).isPresent()) {
            nextSeq++;
            rollNum = String.format("ADM-%d-%03d", currentYear, nextSeq);
        }
        return rollNum;
    }

    @Transactional
    public AdmissionApplication registerStudentApplication(StudentRegistrationDto dto) {
        int currentYear = Year.now().getValue();

        if (applicationRepository.existsByEmailAndAppliedClassAndAcademicYear(dto.getEmail(), dto.getAppliedClass(), currentYear)) {
            throw new IllegalArgumentException("An application for " + dto.getAppliedClass() + " in academic year " + currentYear + " with email " + dto.getEmail() + " already exists.");
        }

        String resolvedUsername = (dto.getUsername() != null && !dto.getUsername().trim().isEmpty())
                ? dto.getUsername().trim()
                : (dto.getEmail() != null && dto.getEmail().contains("@")
                        ? dto.getEmail().split("@")[0].toLowerCase().replaceAll("[^a-zA-Z0-9]", "")
                        : null);

        AdmissionApplication app = new AdmissionApplication();
        app.setApplicationNumber(generateNextApplicationNumber());
        app.setAcademicYear(currentYear);
        app.setStudentName(dto.getFullName());
        app.setEmail(dto.getEmail());
        app.setPhone(dto.getPhone());
        app.setDateOfBirth(dto.getDateOfBirth());
        app.setGender(dto.getGender());
        app.setAddress(dto.getAddress());
        app.setAppliedClass(dto.getAppliedClass());
        app.setPreviousSchool(dto.getPreviousSchool());
        app.setMarksPercentage(dto.getMarksPercentage());
        app.setStatus(ApplicationStatus.PENDING);
        app.setRegisteredBy("STUDENT");
        app.setStudentUsername(resolvedUsername);

        return applicationRepository.save(app);
    }

    public AdmissionApplication adminRegisterStudent(AdminStudentRegistrationDto dto) {
        int currentYear = Year.now().getValue();

        // 1. Pre-validation checks locally (Fail Fast)
        if (applicationRepository.existsByEmailAndAppliedClassAndAcademicYear(dto.getEmail(), dto.getAppliedClass(), currentYear)) {
            throw new IllegalArgumentException("An application for " + dto.getAppliedClass() + " in academic year " + currentYear + " with email " + dto.getEmail() + " already exists.");
        }

        String uname = null;
        boolean authAccountCreated = false;

        if (dto.isCreateUserAccount()) {
            uname = (dto.getUsername() != null && !dto.getUsername().trim().isEmpty())
                    ? dto.getUsername().trim().toLowerCase()
                    : (dto.getEmail() != null && dto.getEmail().contains("@")
                            ? dto.getEmail().substring(0, dto.getEmail().indexOf('@')).toLowerCase().replaceAll("[^a-zA-Z0-9]", "")
                            : "student" + (System.currentTimeMillis() % 10000));

            String password = (dto.getPassword() != null && !dto.getPassword().trim().isEmpty())
                    ? dto.getPassword()
                    : DEFAULT_STUDENT_PASSWORD;

            // --- SAGA STEP 1: Call AUTH-SERVICE via RestTemplate to create credentials in authdb ---
            authServiceClient.registerStudent(
                    uname,
                    password,
                    dto.getEmail().trim().toLowerCase(),
                    dto.getFullName().trim()
            );
            authAccountCreated = true;
        }

        // --- SAGA STEP 2: Save local application in admissiondb ---
        try {
            return saveLocalApplication(dto, uname, currentYear);
        } catch (Exception ex) {
            // --- SAGA COMPENSATING ACTION: Rollback user in AUTH-SERVICE if local save fails ---
            if (authAccountCreated && uname != null) {
                authServiceClient.rollbackUser(uname);
            }
            throw ex;
        }
    }

    @Transactional
    public AdmissionApplication saveLocalApplication(AdminStudentRegistrationDto dto, String uname, int currentYear) {
        AdmissionApplication app = new AdmissionApplication();
        app.setApplicationNumber(generateNextApplicationNumber());
        app.setAcademicYear(currentYear);
        app.setStudentName(dto.getFullName().trim());
        app.setEmail(dto.getEmail().trim());
        app.setPhone(dto.getPhone().trim());
        app.setDateOfBirth(dto.getDateOfBirth());
        app.setGender(dto.getGender());
        app.setAddress(dto.getAddress().trim());
        app.setAppliedClass(dto.getAppliedClass());
        app.setPreviousSchool(dto.getPreviousSchool());
        app.setMarksPercentage(dto.getMarksPercentage());
        app.setRegisteredBy("ADMIN");
        app.setStudentUsername(uname);

        if ("APPROVED".equalsIgnoreCase(dto.getInitialStatus())) {
            app.setStatus(ApplicationStatus.APPROVED);
            String assignedCls = (dto.getAssignedClass() != null && !dto.getAssignedClass().trim().isEmpty()) 
                    ? dto.getAssignedClass().trim() 
                    : dto.getAppliedClass();
            String assignedSec = resolveAssignedSection(dto.getAssignedSection(), assignedCls, app.getAcademicYear(), null);
            app.setAssignedClass(assignedCls);
            app.setAssignedSection(assignedSec);
            app.setPermanentRollNumber(generateNextPermanentRollNumber());
            app.setRemarks(dto.getRemarks() != null && !dto.getRemarks().trim().isEmpty() 
                    ? dto.getRemarks().trim() 
                    : "Directly enrolled by Administrator.");
            app.setDecisionDate(LocalDateTime.now());
        } else {
            app.setStatus(ApplicationStatus.PENDING);
            app.setRemarks(dto.getRemarks());
        }

        return applicationRepository.save(app);
    }

    @Transactional
    public AdmissionApplication approveApplication(Long id, ApprovalDto dto) {
        AdmissionApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with ID: " + id));

        app.setStatus(ApplicationStatus.APPROVED);
        String assignedCls = (dto.getAssignedClass() != null && !dto.getAssignedClass().trim().isEmpty()) 
                ? dto.getAssignedClass().trim() 
                : app.getAppliedClass();
        String assignedSec = resolveAssignedSection(dto.getAssignedSection(), assignedCls, app.getAcademicYear(), app.getId());
        app.setAssignedClass(assignedCls);
        app.setAssignedSection(assignedSec);
        if (app.getPermanentRollNumber() == null) {
            app.setPermanentRollNumber(generateNextPermanentRollNumber());
        }
        if (dto.getRemarks() != null && !dto.getRemarks().trim().isEmpty()) {
            app.setRemarks(dto.getRemarks().trim());
        }
        app.setDecisionDate(LocalDateTime.now());

        return applicationRepository.save(app);
    }

    @Transactional
    public AdmissionApplication rejectApplication(Long id, RejectionDto dto) {
        AdmissionApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with ID: " + id));

        app.setStatus(ApplicationStatus.REJECTED);
        app.setRemarks(dto.getRemarks());
        app.setDecisionDate(LocalDateTime.now());

        return applicationRepository.save(app);
    }

    public Optional<AdmissionApplication> getApplicationForUsername(String username) {
        if (username == null || username.isBlank()) return Optional.empty();
        return applicationRepository.findFirstByStudentUsernameOrderByAppliedDateDesc(username.trim());
    }

    public List<AdmissionApplication> getAllApplicationsForUsername(String username) {
        if (username == null || username.isBlank()) return List.of();
        return applicationRepository.findByStudentUsernameOrderByAppliedDateDesc(username.trim());
    }

    public Optional<AdmissionApplication> findById(Long id) {
        return applicationRepository.findById(id);
    }

    public Optional<AdmissionApplication> findByApplicationNumber(String applicationNumber) {
        return applicationRepository.findByApplicationNumber(applicationNumber);
    }

    public List<AdmissionApplication> getAllApplications() {
        return applicationRepository.findAllByOrderByAppliedDateDesc();
    }

    public Page<AdmissionApplication> getApplicationsPaged(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return applicationRepository.findAllByOrderByAppliedDateDesc(pageable);
    }

    public List<AdmissionApplication> getApplicationsByStatus(ApplicationStatus status) {
        return applicationRepository.findByStatus(status);
    }

    public List<AdmissionApplication> getReport(String className, String section) {
        String filterClass = (className != null && !className.trim().isEmpty() && !"ALL".equalsIgnoreCase(className)) ? className : null;
        String filterSec = (section != null && !section.trim().isEmpty() && !"ALL".equalsIgnoreCase(section)) ? section : null;
        return applicationRepository.findApprovedStudentsForReport(filterClass, filterSec);
    }

    public List<String> getAvailableClasses() {
        return applicationRepository.findDistinctAssignedClasses();
    }

    public List<String> getAvailableSections() {
        return applicationRepository.findDistinctAssignedSections();
    }

    public long countTotal() {
        return applicationRepository.count();
    }

    public long countPending() {
        return applicationRepository.countByStatus(ApplicationStatus.PENDING);
    }

    public long countApproved() {
        return applicationRepository.countByStatus(ApplicationStatus.APPROVED);
    }

    public long countRejected() {
        return applicationRepository.countByStatus(ApplicationStatus.REJECTED);
    }
}
