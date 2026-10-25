package com.example.admission.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "admission_applications",
    uniqueConstraints = @UniqueConstraint(name = "uk_student_academic_year", columnNames = {"student_username", "academic_year"})
)
public class AdmissionApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String applicationNumber;

    @Column(unique = true)
    private String permanentRollNumber;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    private LocalDate dateOfBirth;

    private String gender;

    private String address;

    @Column(nullable = false)
    private String appliedClass;

    private String assignedClass;

    private String assignedSection;

    private String previousSchool;

    private Double marksPercentage;

    @Column(name = "academic_year")
    private Integer academicYear;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(length = 1000)
    private String remarks;

    private String registeredBy; // "STUDENT" or "ADMIN"

    private LocalDateTime appliedDate;

    private LocalDateTime decisionDate;

    @Column(name = "student_username")
    private String studentUsername;

    public AdmissionApplication() {
    }

    @PrePersist
    protected void onCreate() {
        this.appliedDate = LocalDateTime.now();
        if (this.academicYear == null) {
            this.academicYear = java.time.Year.now().getValue();
        }
        if (this.status == null) {
            this.status = ApplicationStatus.PENDING;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApplicationNumber() {
        return applicationNumber;
    }

    public void setApplicationNumber(String applicationNumber) {
        this.applicationNumber = applicationNumber;
    }

    public String getPermanentRollNumber() {
        return permanentRollNumber;
    }

    public void setPermanentRollNumber(String permanentRollNumber) {
        this.permanentRollNumber = permanentRollNumber;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAppliedClass() {
        return appliedClass;
    }

    public void setAppliedClass(String appliedClass) {
        this.appliedClass = appliedClass;
    }

    public String getAssignedClass() {
        return assignedClass;
    }

    public void setAssignedClass(String assignedClass) {
        this.assignedClass = assignedClass;
    }

    public String getAssignedSection() {
        return assignedSection;
    }

    public void setAssignedSection(String assignedSection) {
        this.assignedSection = assignedSection;
    }

    public String getPreviousSchool() {
        return previousSchool;
    }

    public void setPreviousSchool(String previousSchool) {
        this.previousSchool = previousSchool;
    }

    public Double getMarksPercentage() {
        return marksPercentage;
    }

    public void setMarksPercentage(Double marksPercentage) {
        this.marksPercentage = marksPercentage;
    }

    public ApplicationStatus getStatus() {
        return status != null ? status : ApplicationStatus.PENDING;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status != null ? status : ApplicationStatus.PENDING;
    }

    public boolean isPending() {
        return getStatus() == ApplicationStatus.PENDING;
    }

    public boolean isApproved() {
        return getStatus() == ApplicationStatus.APPROVED;
    }

    public boolean isRejected() {
        return getStatus() == ApplicationStatus.REJECTED;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getRegisteredBy() {
        return registeredBy;
    }

    public void setRegisteredBy(String registeredBy) {
        this.registeredBy = registeredBy;
    }

    public LocalDateTime getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDateTime appliedDate) {
        this.appliedDate = appliedDate;
    }

    public LocalDateTime getDecisionDate() {
        return decisionDate;
    }

    public void setDecisionDate(LocalDateTime decisionDate) {
        this.decisionDate = decisionDate;
    }

    public String getStudentUsername() {
        return studentUsername;
    }

    public void setStudentUsername(String studentUsername) {
        this.studentUsername = studentUsername;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }
}
