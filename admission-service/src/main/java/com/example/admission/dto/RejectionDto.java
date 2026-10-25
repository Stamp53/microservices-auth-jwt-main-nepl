package com.example.admission.dto;

import jakarta.validation.constraints.NotBlank;

public class RejectionDto {

    @NotBlank(message = "Please provide a reason or remarks for rejection")
    private String remarks;

    public RejectionDto() {
    }

    public RejectionDto(String remarks) {
        this.remarks = remarks;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
