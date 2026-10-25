import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdmissionApplication,
  AdminDashboardData,
  StudentDashboardData,
  StudentRegistrationDto,
  AdminStudentRegistrationDto,
  ApprovalDto,
  RejectionDto,
  ReportData
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AdmissionService {
  private readonly BASE_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // Public: Student self-registration
  registerStudent(dto: StudentRegistrationDto): Observable<{ success: boolean; message: string; applicationNumber: string }> {
    return this.http.post<{ success: boolean; message: string; applicationNumber: string }>(
      `${this.BASE_URL}/register`,
      dto
    );
  }

  // Public: Track application
  trackApplication(appNum: string): Observable<AdmissionApplication> {
    return this.http.get<AdmissionApplication>(`${this.BASE_URL}/track`, {
      params: { appNum }
    });
  }

  // Student: Get dashboard info
  getStudentDashboard(): Observable<StudentDashboardData> {
    return this.http.get<StudentDashboardData>(`${this.BASE_URL}/student/dashboard`);
  }

  // Admin: Get dashboard stats and recent applications
  getAdminDashboard(page: number = 0, size: number = 10): Observable<AdminDashboardData> {
    return this.http.get<AdminDashboardData>(`${this.BASE_URL}/admin/dashboard`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  // Admin: List applications filtered by status
  getApplications(status: string = 'ALL'): Observable<AdmissionApplication[]> {
    return this.http.get<AdmissionApplication[]>(`${this.BASE_URL}/admin/applications`, {
      params: { status }
    });
  }

  // Admin: Get single application details
  getApplicationById(id: number): Observable<AdmissionApplication> {
    return this.http.get<AdmissionApplication>(`${this.BASE_URL}/admin/applications/${id}`);
  }

  // Admin: Approve application
  approveApplication(id: number, approvalDto: ApprovalDto): Observable<AdmissionApplication> {
    return this.http.post<AdmissionApplication>(
      `${this.BASE_URL}/admin/applications/${id}/approve`,
      approvalDto
    );
  }

  // Admin: Reject application
  rejectApplication(id: number, rejectionDto: RejectionDto): Observable<AdmissionApplication> {
    return this.http.post<AdmissionApplication>(
      `${this.BASE_URL}/admin/applications/${id}/reject`,
      rejectionDto
    );
  }

  // Admin: Directly register student & create application
  adminRegisterStudent(dto: AdminStudentRegistrationDto): Observable<AdmissionApplication> {
    return this.http.post<AdmissionApplication>(`${this.BASE_URL}/admin/register-student`, dto);
  }

  // Admin: Class & section reports
  getReports(className?: string, section?: string): Observable<ReportData> {
    const params: { [key: string]: string } = {};
    if (className) params['className'] = className;
    if (section) params['section'] = section;

    return this.http.get<ReportData>(`${this.BASE_URL}/admin/reports`, { params });
  }
}
