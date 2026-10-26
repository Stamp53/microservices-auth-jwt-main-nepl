import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdmissionService } from '../../services/admission.service';
import { AdmissionApplication, AdminDashboardData, AdminStudentRegistrationDto, ApprovalDto, RejectionDto, ReportData, ALL_CLASSES } from '../../models';
import { parseApiError } from '../../utils/error.util';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <h2>Admissions Administration</h2>
          <p>Review student applications, approve assignments, and inspect section reports</p>
        </div>
        <div class="view-toggles">
          <button
            (click)="activeView = 'applications'; clearAlert()"
            class="toggle-btn"
            [class.active]="activeView === 'applications'"
          >
            📋 Applications
          </button>
          <button
            (click)="activeView = 'reports'; loadReports(); clearAlert()"
            class="toggle-btn"
            [class.active]="activeView === 'reports'"
          >
            📊 Class Reports
          </button>
          <button
            (click)="activeView = 'register'; clearAlert()"
            class="toggle-btn"
            [class.active]="activeView === 'register'"
          >
            ➕ Register Admission
          </button>
        </div>
      </div>

      <!-- Overview Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-value">{{ dashboardStats?.totalCount || 0 }}</div>
          <div class="stat-label">Total Applications</div>
        </div>
        <div class="stat-card pending">
          <div class="stat-value">{{ dashboardStats?.pendingCount || 0 }}</div>
          <div class="stat-label">Pending Review</div>
        </div>
        <div class="stat-card approved">
          <div class="stat-value">{{ dashboardStats?.approvedCount || 0 }}</div>
          <div class="stat-label">Approved & Enrolled</div>
        </div>
        <div class="stat-card rejected">
          <div class="stat-value">{{ dashboardStats?.rejectedCount || 0 }}</div>
          <div class="stat-label">Rejected</div>
        </div>
      </div>

      @if (alertMessage) {
        <div class="alert" [ngClass]="alertType === 'success' ? 'alert-success' : 'alert-error'">
          <span>{{ alertMessage }}</span>
          <button type="button" class="alert-close" (click)="clearAlert()" title="Dismiss">&times;</button>
        </div>
      }

      <!-- VIEW 1: Applications Management -->
      @if (activeView === 'applications') {
        <div class="card table-card">
          <div class="table-toolbar">
            <div class="filter-tabs">
              <button (click)="filterStatus('ALL')" [class.active]="currentStatus === 'ALL'">All ({{ dashboardStats?.totalCount || 0 }})</button>
              <button (click)="filterStatus('PENDING')" [class.active]="currentStatus === 'PENDING'">Pending ({{ dashboardStats?.pendingCount || 0 }})</button>
              <button (click)="filterStatus('APPROVED')" [class.active]="currentStatus === 'APPROVED'">Approved ({{ dashboardStats?.approvedCount || 0 }})</button>
              <button (click)="filterStatus('REJECTED')" [class.active]="currentStatus === 'REJECTED'">Rejected ({{ dashboardStats?.rejectedCount || 0 }})</button>
            </div>
            <button (click)="loadApplications()" class="btn-refresh">🔄 Refresh</button>
          </div>

          @if (loading) {
            <div class="loading-state">Loading applications...</div>
          } @else if (applications.length === 0) {
            <div class="empty-state">No applications found under "{{ currentStatus }}".</div>
          } @else {
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>App Number</th>
                    <th>Student Name</th>
                    <th>Applied Class</th>
                    <th>Marks (%)</th>
                    <th>Status</th>
                    <th>Roll No / Assigned</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (app of applications; track app.id) {
                    <tr>
                      <td class="mono font-bold">{{ app.applicationNumber }}</td>
                      <td>
                        <div class="student-name">{{ app.studentName }}</div>
                        <div class="student-meta">{{ app.email }} • {{ app.phone }}</div>
                      </td>
                      <td>{{ app.appliedClass }}</td>
                      <td><span class="marks-badge">{{ app.marksPercentage }}%</span></td>
                      <td>
                        <span class="badge" [ngClass]="app.status?.toLowerCase()">
                          {{ app.status }}
                        </span>
                      </td>
                      <td>
                        @if (app.status === 'APPROVED') {
                          <div class="roll-number">{{ app.permanentRollNumber }}</div>
                          <div class="section-tag">{{ app.assignedClass }} - {{ app.assignedSection }}</div>
                        } @else if (app.status === 'REJECTED') {
                          <span class="remarks-text">{{ app.remarks || 'Rejected' }}</span>
                        } @else {
                          <span class="text-muted">Awaiting decision</span>
                        }
                      </td>
                      <td class="action-cell">
                        <button
                          (click)="openApproveModal(app)"
                          class="btn-action btn-approve"
                          title="Approve / Assign"
                        >
                          Approve
                        </button>
                        @if (app.status !== 'REJECTED') {
                          <button
                            (click)="openRejectModal(app)"
                            class="btn-action btn-reject"
                            title="Reject Application"
                          >
                            Reject
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- VIEW 2: Reports -->
      @if (activeView === 'reports') {
        <div class="card report-card">
          <div class="report-header">
            <h3>Class & Section Enrollment Report</h3>
            <div class="report-filters">
              <select [(ngModel)]="reportClass" (change)="loadReports()" class="form-select">
                <option value="">All Classes</option>
                @for (c of reportData?.availableClasses || []; track c) {
                  <option [value]="c">{{ c }}</option>
                }
              </select>

              <select [(ngModel)]="reportSection" (change)="loadReports()" class="form-select">
                <option value="">All Sections</option>
                @for (s of reportData?.availableSections || []; track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </select>

              <div class="enrolled-count">
                Enrolled: <strong>{{ reportData?.totalEnrolled || 0 }}</strong>
              </div>
            </div>
          </div>

          @if (reportLoading) {
            <div class="loading-state">Loading report data...</div>
          } @else if (!reportData?.students || reportData!.students.length === 0) {
            <div class="empty-state">No students found matching current class and section filters.</div>
          } @else {
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Assigned Class</th>
                    <th>Section</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  @for (s of reportData?.students || []; track s.id) {
                    <tr>
                      <td class="mono font-bold">{{ s.permanentRollNumber }}</td>
                      <td>{{ s.studentName }}</td>
                      <td>{{ s.assignedClass }}</td>
                      <td><span class="section-tag">{{ s.assignedSection }}</span></td>
                      <td>{{ s.email }}</td>
                      <td>{{ s.phone }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- VIEW 3: Direct Student Admission Registration -->
      @if (activeView === 'register') {
        <div class="card form-card">
          <div class="card-header">
            <h3>Direct Student Admission</h3>
            <p>Directly register a student application and assign class and section</p>
          </div>

          <form (ngSubmit)="submitAdminRegister()" #regForm="ngForm">
            <div class="form-grid">
              <div class="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  [(ngModel)]="adminRegisterDto.fullName"
                  required
                  placeholder="e.g. John Doe"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="adminRegisterDto.email"
                  required
                  placeholder="e.g. john@example.com"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Mobile Number (10 digits) *</label>
                <input
                  type="tel"
                  name="phone"
                  [(ngModel)]="adminRegisterDto.phone"
                  required
                  pattern="[0-9]{10}"
                  placeholder="e.g. 9876543210"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  [(ngModel)]="adminRegisterDto.dateOfBirth"
                  required
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Gender *</label>
                <select name="gender" [(ngModel)]="adminRegisterDto.gender" class="form-control">
                  <option value="" disabled selected>-- Select Gender --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label>Applied Class *</label>
                <select name="appliedClass" [(ngModel)]="adminRegisterDto.appliedClass" class="form-control">
                  @for (cls of classes; track cls) {
                    <option [value]="cls">{{ cls }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label>Previous School</label>
                <input
                  type="text"
                  name="previousSchool"
                  [(ngModel)]="adminRegisterDto.previousSchool"
                  placeholder="e.g. St. Xavier's High School"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>Marks Percentage (%) *</label>
                <input
                  type="number"
                  name="marksPercentage"
                  [(ngModel)]="adminRegisterDto.marksPercentage"
                  min="0"
                  max="100"
                  required
                  placeholder="e.g. 85.5"
                  class="form-control"
                />
              </div>

              <div class="form-group full-width">
                <label>Residential Address *</label>
                <textarea
                  name="address"
                  [(ngModel)]="adminRegisterDto.address"
                  required
                  rows="2"
                  placeholder="Enter full address"
                  class="form-control"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Initial Status *</label>
                <select name="initialStatus" [(ngModel)]="adminRegisterDto.initialStatus" class="form-control">
                  <option value="PENDING">PENDING (Needs manual review later)</option>
                  <option value="APPROVED">APPROVED (Immediate admission & enrollment)</option>
                </select>
              </div>

              @if (adminRegisterDto.initialStatus === 'APPROVED') {
                <div class="form-group">
                  <label>Assigned Class</label>
                  <select name="assignedClass" [(ngModel)]="adminRegisterDto.assignedClass" class="form-control">
                    @for (cls of classes; track cls) {
                      <option [value]="cls">{{ cls }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label>Assigned Section</label>
                  <select name="assignedSection" [(ngModel)]="adminRegisterDto.assignedSection" class="form-control">
                    <option value="AUTO">AUTO (Automatic allocation based on capacity)</option>
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                  </select>
                </div>
              }

              <div class="form-group full-width">
                <label>Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  [(ngModel)]="adminRegisterDto.remarks"
                  placeholder="e.g. Registered directly by administration"
                  class="form-control"
                />
              </div>

              <div class="form-group full-width checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    name="createUserAccount"
                    [(ngModel)]="adminRegisterDto.createUserAccount"
                  />
                  <span>Create a student login account</span>
                </label>
              </div>

              @if (adminRegisterDto.createUserAccount) {
                <div class="form-group">
                  <label>Username (optional - auto-generated if blank)</label>
                  <input
                    type="text"
                    name="username"
                    [(ngModel)]="adminRegisterDto.username"
                    placeholder="e.g. john_doe"
                    class="form-control"
                  />
                </div>

                <div class="form-group">
                  <label>Password (optional - default: student123)</label>
                  <input
                    type="password"
                    name="password"
                    [(ngModel)]="adminRegisterDto.password"
                    placeholder="Leave blank for student123"
                    class="form-control"
                  />
                </div>
              }
            </div>

            <div class="form-actions">
              <button
                type="submit"
                [disabled]="registerSubmitting"
                class="btn btn-primary"
              >
                {{ registerSubmitting ? 'Registering...' : 'Submit Admission Registration' }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- APPROVE MODAL -->
      @if (selectedAppForApprove) {
        <div class="modal-backdrop">
          <div class="modal">
            <h3>Approve Application: {{ selectedAppForApprove.applicationNumber }}</h3>
            <p class="modal-desc">Assign student to a specific class and section (30 max capacity per section)</p>

            <div class="form-group">
              <label>Assigned Class</label>
              <select [(ngModel)]="approvalForm.assignedClass" class="form-control">
                @for (cls of classes; track cls) {
                  <option [value]="cls">{{ cls }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label>Assigned Section</label>
              <select [(ngModel)]="approvalForm.assignedSection" class="form-control">
                <option value="AUTO">AUTO (Automatic allocation based on capacity)</option>
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
                <option value="Section C">Section C</option>
              </select>
            </div>

            <div class="form-group">
              <label>Remarks</label>
              <input
                type="text"
                [(ngModel)]="approvalForm.remarks"
                placeholder="e.g. Admitted on merit"
                class="form-control"
              />
            </div>

            <div class="modal-actions">
              <button (click)="selectedAppForApprove = null" class="btn btn-secondary">Cancel</button>
              <button (click)="submitApprove()" class="btn btn-primary">Confirm & Approve</button>
            </div>
          </div>
        </div>
      }

      <!-- REJECT MODAL -->
      @if (selectedAppForReject) {
        <div class="modal-backdrop">
          <div class="modal">
            <h3>Reject Application: {{ selectedAppForReject.applicationNumber }}</h3>
            <p class="modal-desc">Please provide a reason for rejecting this admission request</p>

            <div class="form-group">
              <label>Rejection Reason / Remarks</label>
              <textarea
                [(ngModel)]="rejectionForm.remarks"
                rows="3"
                placeholder="e.g. Cut-off criteria not met."
                class="form-control"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button (click)="selectedAppForReject = null" class="btn btn-secondary">Cancel</button>
              <button (click)="submitReject()" class="btn btn-danger">Confirm Rejection</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .admin-header h2 {
      margin: 0 0 0.25rem 0;
      color: #0f172a;
    }
    .admin-header p {
      margin: 0;
      color: #64748b;
      font-size: 0.95rem;
    }
    .view-toggles {
      display: flex;
      gap: 0.5rem;
      background: #f1f5f9;
      padding: 0.25rem;
      border-radius: 8px;
    }
    .toggle-btn {
      border: none;
      background: transparent;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.15s;
    }
    .toggle-btn.active {
      background: white;
      color: #2563eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 1.25rem;
      border-left: 4px solid #cbd5e1;
    }
    .stat-card.total { border-left-color: #3b82f6; }
    .stat-card.pending { border-left-color: #f59e0b; }
    .stat-card.approved { border-left-color: #10b981; }
    .stat-card.rejected { border-left-color: #ef4444; }
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
    }
    .stat-label {
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 600;
      margin-top: 0.25rem;
    }
    .card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .filter-tabs {
      display: flex;
      gap: 0.5rem;
    }
    .filter-tabs button {
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #475569;
      cursor: pointer;
    }
    .filter-tabs button.active {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
    }
    .btn-refresh {
      background: white;
      border: 1px solid #cbd5e1;
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }
    .data-table th {
      background: #f8fafc;
      padding: 0.75rem 1rem;
      color: #475569;
      font-weight: 600;
      border-bottom: 2px solid #e2e8f0;
    }
    .data-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .mono { font-family: monospace; }
    .font-bold { font-weight: 700; color: #1e293b; }
    .student-name { font-weight: 600; color: #0f172a; }
    .student-meta { font-size: 0.8rem; color: #64748b; }
    .marks-badge {
      background: #f1f5f9;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .badge.approved { background: #dcfce7; color: #166534; }
    .badge.pending { background: #fef3c7; color: #92400e; }
    .badge.rejected { background: #fee2e2; color: #991b1b; }
    .roll-number { font-weight: 700; color: #15803d; font-family: monospace; font-size: 0.85rem; }
    .section-tag { font-size: 0.775rem; color: #475569; }
    .remarks-text { font-size: 0.8rem; color: #b91c1c; }
    .action-cell { white-space: nowrap; }
    .btn-action {
      border: none;
      padding: 0.35rem 0.65rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      margin-right: 0.4rem;
    }
    .btn-approve { background: #2563eb; color: white; }
    .btn-approve:hover { background: #1d4ed8; }
    .btn-reject { background: #fee2e2; color: #b91c1c; }
    .btn-reject:hover { background: #fecaca; }
    .loading-state, .empty-state {
      padding: 3rem;
      text-align: center;
      color: #64748b;
    }
    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .report-header h3 { margin: 0; }
    .report-filters {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .form-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.9rem;
    }
    .enrolled-count {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    }
    .modal h3 { margin: 0 0 0.35rem 0; color: #0f172a; }
    .modal-desc { margin: 0 0 1.25rem 0; color: #64748b; font-size: 0.875rem; }
    .form-group {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-group label {
      font-size: 0.825rem;
      font-weight: 600;
      color: #334155;
    }
    .form-control {
      padding: 0.65rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.925rem;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    .btn {
      padding: 0.65rem 1.25rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #f1f5f9; color: #334155; }
    .btn-danger { background: #dc2626; color: white; }
    .alert {
      padding: 0.85rem 1.25rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
    .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
    .alert-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
      padding: 0 0 0 1rem;
    }
    .alert-close:hover { opacity: 1; }
    .form-card {
      padding: 1.75rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .form-card .card-header h3 {
      margin: 0 0 0.35rem 0;
      font-size: 1.15rem;
      color: #0f172a;
    }
    .form-card .card-header p {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
      margin-top: 1.25rem;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .checkbox-group {
      margin-top: 0.5rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.925rem;
      font-weight: 500;
      color: #1e293b;
      cursor: pointer;
    }
    .checkbox-label input[type="checkbox"] {
      width: 1.1rem;
      height: 1.1rem;
      accent-color: #2563eb;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid #f1f5f9;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  classes = ALL_CLASSES;
  activeView: 'applications' | 'reports' | 'register' = 'applications';
  dashboardStats: AdminDashboardData | null = null;
  applications: AdmissionApplication[] = [];
  currentStatus = 'ALL';
  loading = false;

  adminRegisterDto: AdminStudentRegistrationDto = this.getInitialAdminRegisterDto();
  registerSubmitting = false;

  reportData: ReportData | null = null;
  reportClass = '';
  reportSection = '';
  reportLoading = false;

  alertMessage = '';
  alertType: 'success' | 'error' = 'success';

  selectedAppForApprove: AdmissionApplication | null = null;
  approvalForm: ApprovalDto = { assignedClass: 'Class 1', assignedSection: 'AUTO', remarks: 'Admitted on merit' };

  selectedAppForReject: AdmissionApplication | null = null;
  rejectionForm: RejectionDto = { remarks: 'Cut-off eligibility criteria not satisfied.' };

  constructor(private admissionService: AdmissionService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadApplications();
  }

  loadStats(): void {
    this.admissionService.getAdminDashboard(0, 10).subscribe({
      next: (data) => (this.dashboardStats = data)
    });
  }

  loadApplications(): void {
    this.loading = true;
    this.admissionService.getApplications(this.currentStatus).subscribe({
      next: (data) => {
        this.loading = false;
        this.applications = data;
      },
      error: () => (this.loading = false)
    });
  }

  filterStatus(status: string): void {
    this.currentStatus = status;
    this.loadApplications();
  }

  loadReports(): void {
    this.reportLoading = true;
    this.admissionService.getReports(this.reportClass, this.reportSection).subscribe({
      next: (data) => {
        this.reportLoading = false;
        this.reportData = data;
      },
      error: () => (this.reportLoading = false)
    });
  }

  openApproveModal(app: AdmissionApplication): void {
    this.selectedAppForApprove = app;
    this.approvalForm = {
      assignedClass: app.assignedClass || app.appliedClass,
      assignedSection: app.assignedSection || 'AUTO',
      remarks: app.remarks || 'Admitted directly on merit'
    };
  }

  submitApprove(): void {
    if (!this.selectedAppForApprove?.id) return;

    this.admissionService.approveApplication(this.selectedAppForApprove.id, this.approvalForm).subscribe({
      next: (updated) => {
        this.showAlert(`Application ${updated.applicationNumber} approved! Assigned Roll No: ${updated.permanentRollNumber}`, 'success');
        this.selectedAppForApprove = null;
        this.loadStats();
        this.loadApplications();
      },
      error: (err) => {
        this.showAlert(parseApiError(err), 'error');
      }
    });
  }

  openRejectModal(app: AdmissionApplication): void {
    this.selectedAppForReject = app;
    this.rejectionForm = { remarks: app.remarks || 'Minimum qualifying percentage criteria not met.' };
  }

  submitReject(): void {
    if (!this.selectedAppForReject?.id) return;

    this.admissionService.rejectApplication(this.selectedAppForReject.id, this.rejectionForm).subscribe({
      next: (updated) => {
        this.showAlert(`Application ${updated.applicationNumber} has been rejected.`, 'error');
        this.selectedAppForReject = null;
        this.loadStats();
        this.loadApplications();
      },
      error: (err) => {
        this.showAlert(parseApiError(err), 'error');
      }
    });
  }

  getInitialAdminRegisterDto(): AdminStudentRegistrationDto {
    return {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      appliedClass: 'Class 1',
      previousSchool: '',
      marksPercentage: 80,
      createUserAccount: true,
      username: '',
      password: '',
      initialStatus: 'PENDING',
      assignedClass: 'Class 1',
      assignedSection: 'AUTO',
      remarks: 'Registered by Administration'
    };
  }

  submitAdminRegister(): void {
    this.clearAlert();
    this.registerSubmitting = true;
    const payload = {
      ...this.adminRegisterDto,
      fullName: this.adminRegisterDto.fullName || (this.adminRegisterDto as any).studentName,
      studentName: this.adminRegisterDto.fullName || (this.adminRegisterDto as any).studentName
    };
    this.admissionService.adminRegisterStudent(payload as any).subscribe({
      next: (created) => {
        this.registerSubmitting = false;
        this.showAlert(`Student admission registered successfully! Application Number: ${created.applicationNumber}`, 'success');
        this.adminRegisterDto = this.getInitialAdminRegisterDto();
        this.loadStats();
        this.loadApplications();
        this.activeView = 'applications';
      },
      error: (err) => {
        this.registerSubmitting = false;
        this.showAlert(parseApiError(err), 'error');
      }
    });
  }

  private alertTimer: any = null;

  showAlert(msg: string, type: 'success' | 'error'): void {
    this.clearAlert();
    this.alertMessage = msg;
    this.alertType = type;

    // Only auto-dismiss success alerts after 6 seconds; keep error alerts visible until the user submits or performs another action
    if (type === 'success') {
      this.alertTimer = setTimeout(() => {
        this.alertMessage = '';
        this.alertTimer = null;
      }, 6000);
    }
  }

  clearAlert(): void {
    if (this.alertTimer) {
      clearTimeout(this.alertTimer);
      this.alertTimer = null;
    }
    this.alertMessage = '';
  }
}
