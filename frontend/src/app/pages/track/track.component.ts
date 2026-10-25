import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdmissionService } from '../../services/admission.service';
import { AdmissionApplication } from '../../models';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="search-card">
        <h2>Track Application Status</h2>
        <p>Enter your application reference number to check real-time admission progress</p>

        <form (ngSubmit)="onSearch()" class="search-form">
          <input
            type="text"
            [(ngModel)]="searchNumber"
            name="searchNumber"
            placeholder="e.g. APP-2026-1001"
            class="form-control"
            required
          />
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Searching...' : 'Track' }}
          </button>
        </form>

        <div class="sample-hint">
          <span>Try sample numbers:</span>
          <button type="button" (click)="searchSample('APP-2026-1001')" class="hint-btn">APP-2026-1001 (Approved)</button>
          <button type="button" (click)="searchSample('APP-2026-1004')" class="hint-btn">APP-2026-1004 (Pending)</button>
          <button type="button" (click)="searchSample('APP-2026-1005')" class="hint-btn">APP-2026-1005 (Rejected)</button>
        </div>
      </div>

      @if (errorMessage) {
        <div class="alert alert-error">
          {{ errorMessage }}
        </div>
      }

      @if (application) {
        <div class="result-card">
          <div class="status-header">
            <div>
              <span class="app-label">Application Number</span>
              <h3 class="app-num">{{ application.applicationNumber }}</h3>
            </div>
            <div>
              <span class="badge" [ngClass]="application.status?.toLowerCase()">
                {{ application.status }}
              </span>
            </div>
          </div>

          @if (application.status === 'APPROVED') {
            <div class="banner banner-success">
              <span class="banner-icon">✅</span>
              <div>
                <strong>Congratulations!</strong> Your admission has been officially approved.
                @if (application.permanentRollNumber) {
                  <div>Your Permanent Roll Number is: <strong>{{ application.permanentRollNumber }}</strong></div>
                }
              </div>
            </div>
          }

          @if (application.status === 'PENDING') {
            <div class="banner banner-warning">
              <span class="banner-icon">⏳</span>
              <div>
                <strong>Application Under Review.</strong> The admissions committee is reviewing your details.
              </div>
            </div>
          }

          @if (application.status === 'REJECTED') {
            <div class="banner banner-danger">
              <span class="banner-icon">❌</span>
              <div>
                <strong>Application Not Accepted.</strong>
                @if (application.remarks) {
                  <div>Reason: {{ application.remarks }}</div>
                }
              </div>
            </div>
          }

          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Student Name</span>
              <span class="detail-value">{{ application.studentName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Applied Class</span>
              <span class="detail-value">{{ application.appliedClass }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Assigned Class</span>
              <span class="detail-value">{{ application.assignedClass || 'Pending' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Assigned Section</span>
              <span class="detail-value">{{ application.assignedSection || 'Pending' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Previous School</span>
              <span class="detail-value">{{ application.previousSchool }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Academic Year</span>
              <span class="detail-value">{{ application.academicYear }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Marks Percentage</span>
              <span class="detail-value">{{ application.marksPercentage }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Application Date</span>
              <span class="detail-value">{{ application.appliedDate ? (application.appliedDate | date:'mediumDate') : 'N/A' }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 800px;
      margin: 2.5rem auto;
      padding: 0 1rem;
    }
    .search-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      margin-bottom: 2rem;
      text-align: center;
    }
    .search-card h2 {
      margin: 0 0 0.4rem 0;
      color: #0f172a;
    }
    .search-card p {
      margin: 0 0 1.5rem 0;
      color: #64748b;
      font-size: 0.95rem;
    }
    .search-form {
      display: flex;
      gap: 0.75rem;
      max-width: 500px;
      margin: 0 auto;
    }
    .form-control {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 1rem;
    }
    .form-control:focus {
      outline: none;
      border-color: #2563eb;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }
    .sample-hint {
      margin-top: 1.25rem;
      font-size: 0.825rem;
      color: #64748b;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    }
    .hint-btn {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      color: #3b82f6;
    }
    .hint-btn:hover {
      background: #e2e8f0;
    }
    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .result-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1.25rem;
      margin-bottom: 1.25rem;
    }
    .app-label {
      font-size: 0.8rem;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .app-num {
      margin: 0.2rem 0 0 0;
      font-family: monospace;
      color: #0f172a;
      font-size: 1.4rem;
    }
    .badge {
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge.approved {
      background: #dcfce7;
      color: #166534;
    }
    .badge.pending {
      background: #fef3c7;
      color: #92400e;
    }
    .badge.rejected {
      background: #fee2e2;
      color: #991b1b;
    }
    .banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }
    .banner-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .banner-warning {
      background: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
    }
    .banner-danger {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    .banner-icon {
      font-size: 1.25rem;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.25rem;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .detail-label {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }
    .detail-value {
      font-size: 1rem;
      color: #1e293b;
      font-weight: 500;
    }
  `]
})
export class TrackComponent implements OnInit {
  searchNumber = '';
  loading = false;
  application: AdmissionApplication | null = null;
  errorMessage = '';

  constructor(
    private admissionService: AdmissionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['appNum']) {
        this.searchNumber = params['appNum'];
        this.onSearch();
      }
    });
  }

  onSearch(): void {
    if (!this.searchNumber.trim()) return;

    this.loading = true;
    this.errorMessage = '';
    this.application = null;

    this.admissionService.trackApplication(this.searchNumber.trim()).subscribe({
      next: (data) => {
        this.loading = false;
        this.application = data;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'No application found with that number.';
      }
    });
  }

  searchSample(sampleNum: string): void {
    this.searchNumber = sampleNum;
    this.onSearch();
  }
}
