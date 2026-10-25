import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdmissionService } from '../../services/admission.service';
import { StudentDashboardData, AdmissionApplication } from '../../models';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="student-container">
      <div class="welcome-card">
        <div class="avatar-icon">🎓</div>
        <div>
          <h2>Welcome, {{ dashboardData?.fullName || dashboardData?.username || 'Student' }}!</h2>
          <p>Track your student admission application progress and enrolled details</p>
        </div>
      </div>

      @if (loading) {
        <div class="loading-state">Loading your admission details...</div>
      } @else if (dashboardData?.hasApplication && app) {

        <!-- STATUS BANNER -->
        @if (app.status === 'APPROVED') {
          <div class="banner banner-approved">
            <div class="banner-icon">🎉</div>
            <div class="banner-content">
              <h3>Admission Approved!</h3>
              <p>Congratulations, your application has been approved and you are officially enrolled.</p>
              @if (app.permanentRollNumber) {
                <div class="roll-pill">Permanent Roll Number: <strong>{{ app.permanentRollNumber }}</strong></div>
              }
            </div>
          </div>
        }

        @if (app.status === 'PENDING') {
          <div class="banner banner-pending">
            <div class="banner-icon">⏳</div>
            <div class="banner-content">
              <h3>Application Under Review</h3>
              <p>Your application is currently being evaluated by the school admissions office.</p>
            </div>
          </div>
        }

        @if (app.status === 'REJECTED') {
          <div class="banner banner-rejected">
            <div class="banner-icon">⚠️</div>
            <div class="banner-content">
              <h3>Application Not Approved</h3>
              <p>{{ app.remarks || 'Your application did not satisfy the minimum entry cut-off criteria.' }}</p>
            </div>
          </div>
        }

        <!-- APPLICATION SUMMARY CARD -->
        <div class="card app-details-card">
          <div class="card-header">
            <div>
              <span class="sub-label">Reference Number</span>
              <h3 class="app-num">{{ app.applicationNumber }}</h3>
            </div>
            <span class="badge" [ngClass]="app.status?.toLowerCase()">
              {{ app.status }}
            </span>
          </div>

          <div class="grid-details">
            <div class="info-group">
              <span class="info-label">Applied Class</span>
              <span class="info-value">{{ app.appliedClass }}</span>
            </div>
            <div class="info-group">
              <span class="info-label">Assigned Class</span>
              <span class="info-value">{{ app.assignedClass || 'Awaiting Review' }}</span>
            </div>
            <div class="info-group">
              <span class="info-label">Assigned Section</span>
              <span class="info-value">{{ app.assignedSection || 'Awaiting Review' }}</span>
            </div>
            <div class="info-group">
              <span class="info-label">Academic Year</span>
              <span class="info-value">{{ app.academicYear }}</span>
            </div>
            <div class="info-group">
              <span class="info-label">Contact Email</span>
              <span class="info-value">{{ app.email }}</span>
            </div>
            <div class="info-group">
              <span class="info-label">Phone</span>
              <span class="info-value">{{ app.phone }}</span>
            </div>
            <div class="info-group">
              <span class="info-label">Previous School</span>
              <span class="info-value">{{ app.previousSchool }}</span>
            </div>
            <div class="info-group">
              <span class="info-label">Marks / Score</span>
              <span class="info-value">{{ app.marksPercentage }}%</span>
            </div>
          </div>

          @if (app.remarks) {
            <div class="remarks-box">
              <span class="info-label">Admissions Remarks:</span>
              <p>{{ app.remarks }}</p>
            </div>
          }
        </div>
      } @else {
        <div class="card empty-card">
          <h3>No Application on Record</h3>
          <p>You haven't submitted an admission application under this student account yet.</p>
          <a routerLink="/register" class="btn btn-primary">Submit Admission Application</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .student-container {
      max-width: 900px;
      margin: 2.5rem auto;
      padding: 0 1.5rem;
    }
    .welcome-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.75rem 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .avatar-icon {
      font-size: 2.75rem;
      background: #eff6ff;
      padding: 0.75rem;
      border-radius: 12px;
    }
    .welcome-card h2 {
      margin: 0 0 0.25rem 0;
      color: #0f172a;
    }
    .welcome-card p {
      margin: 0;
      color: #64748b;
      font-size: 0.95rem;
    }
    .banner {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }
    .banner-icon { font-size: 2rem; }
    .banner-content h3 { margin: 0 0 0.25rem 0; }
    .banner-content p { margin: 0; font-size: 0.95rem; }
    .banner-approved {
      background: #f0fdf4;
      border: 1px solid #86efac;
      color: #166534;
    }
    .roll-pill {
      display: inline-block;
      margin-top: 0.75rem;
      background: #dcfce7;
      padding: 0.4rem 0.85rem;
      border-radius: 6px;
      font-family: monospace;
      font-size: 1rem;
    }
    .banner-pending {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
    }
    .banner-rejected {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    .card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .sub-label {
      font-size: 0.775rem;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .app-num {
      margin: 0.2rem 0 0 0;
      font-family: monospace;
      color: #0f172a;
      font-size: 1.35rem;
    }
    .badge {
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge.approved { background: #dcfce7; color: #166534; }
    .badge.pending { background: #fef3c7; color: #92400e; }
    .badge.rejected { background: #fee2e2; color: #991b1b; }
    .grid-details {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    .info-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .info-label {
      font-size: 0.8rem;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .info-value {
      font-size: 1.05rem;
      color: #0f172a;
      font-weight: 500;
    }
    .remarks-box {
      margin-top: 1.75rem;
      padding: 1rem 1.25rem;
      background: #f8fafc;
      border-left: 3px solid #cbd5e1;
      border-radius: 6px;
    }
    .remarks-box p {
      margin: 0.35rem 0 0 0;
      color: #334155;
    }
    .empty-card {
      text-align: center;
      padding: 3rem 1rem;
    }
    .empty-card h3 { margin: 0 0 0.5rem 0; color: #0f172a; }
    .empty-card p { margin: 0 0 1.5rem 0; color: #64748b; }
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    .loading-state {
      padding: 3rem;
      text-align: center;
      color: #64748b;
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  dashboardData: StudentDashboardData | null = null;
  loading = true;

  get app(): AdmissionApplication | undefined {
    return this.dashboardData?.admissionApp;
  }

  constructor(private admissionService: AdmissionService) {}

  ngOnInit(): void {
    this.admissionService.getStudentDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
