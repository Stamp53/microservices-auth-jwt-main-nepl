package com.example.admission.repository;

import com.example.admission.model.AdmissionApplication;
import com.example.admission.model.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionApplicationRepository extends JpaRepository<AdmissionApplication, Long> {

    Optional<AdmissionApplication> findFirstByStudentUsernameOrderByAppliedDateDesc(String studentUsername);

    Optional<AdmissionApplication> findFirstByEmailOrderByAppliedDateDesc(String email);

    List<AdmissionApplication> findByStudentUsernameOrderByAppliedDateDesc(String studentUsername);

    List<AdmissionApplication> findByEmailOrderByAppliedDateDesc(String email);

    boolean existsByStudentUsernameAndAcademicYear(String studentUsername, Integer academicYear);

    boolean existsByEmailAndAppliedClassAndAcademicYear(String email, String appliedClass, Integer academicYear);

    Optional<AdmissionApplication> findByApplicationNumber(String applicationNumber);

    Optional<AdmissionApplication> findByPermanentRollNumber(String permanentRollNumber);

    List<AdmissionApplication> findByStatus(ApplicationStatus status);

    List<AdmissionApplication> findAllByOrderByAppliedDateDesc();

    Page<AdmissionApplication> findAllByOrderByAppliedDateDesc(Pageable pageable);

    long countByStatus(ApplicationStatus status);

    // Class and Section reporting queries
    @Query("SELECT a FROM AdmissionApplication a WHERE a.status = 'APPROVED' AND (:className IS NULL OR a.assignedClass = :className) AND (:section IS NULL OR a.assignedSection = :section) ORDER BY a.assignedClass, a.assignedSection, a.permanentRollNumber")
    List<AdmissionApplication> findApprovedStudentsForReport(@Param("className") String className, @Param("section") String section);

    @Query("SELECT DISTINCT a.assignedClass FROM AdmissionApplication a WHERE a.status = 'APPROVED' AND a.assignedClass IS NOT NULL ORDER BY a.assignedClass")
    List<String> findDistinctAssignedClasses();

    @Query("SELECT DISTINCT a.assignedSection FROM AdmissionApplication a WHERE a.status = 'APPROVED' AND a.assignedSection IS NOT NULL ORDER BY a.assignedSection")
    List<String> findDistinctAssignedSections();

    @Query("SELECT COUNT(a) FROM AdmissionApplication a WHERE a.status = 'APPROVED' AND a.assignedClass = :assignedClass AND a.assignedSection = :section AND a.academicYear = :academicYear AND (:excludeId IS NULL OR a.id != :excludeId)")
    long countApprovedInSection(@Param("assignedClass") String assignedClass,
                                @Param("section") String section,
                                @Param("academicYear") Integer academicYear,
                                @Param("excludeId") Long excludeId);
}
