package com.example.admission.dto;

import jakarta.validation.constraints.NotBlank;

public class ApprovalDto {

    @NotBlank(message = "Assigned class is required")
    private String assignedClass;

    private String assignedSection;

    private String remarks;

    public ApprovalDto() {
    }

    public ApprovalDto(String assignedClass, String assignedSection, String remarks) {
        this.assignedClass = assignedClass;
        this.assignedSection = assignedSection;
        this.remarks = remarks;
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
