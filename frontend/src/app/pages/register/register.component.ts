import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdmissionService } from '../../services/admission.service';
import { AuthService } from '../../services/auth.service';
import { StudentRegistrationDto, ALL_CLASSES } from '../../models';
import { parseApiError } from '../../utils/error.util';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="card form-card">
        <div class="header">
          <div class="academic-badge">Academic Admissions</div>
          <h2>Academic Admission Application</h2>
          <p>Submit your academic credentials and school admission application form</p>
        </div>

        @if (!authService.isLoggedIn()) {
          <div class="account-tip">
            <span>💡 Just want to create a portal account? <a routerLink="/signup">Click here to Sign Up</a> instead. Fill out this form only when applying for school admission.</span>
          </div>
        }

        @if (successData) {
          <div class="success-box">
            <div class="success-icon">🎉</div>
            <h3>Application Submitted Successfully!</h3>
            <p>Your unique Application Number is:</p>
            <div class="app-number-display">{{ successData.applicationNumber }}</div>
            <p class="success-note">
              Please save this application number. You can track your admission status at any time, or log in with your credentials.
            </p>
            <div class="success-actions">
              <a [routerLink]="['/track']" [queryParams]="{ appNum: successData.applicationNumber }" class="btn btn-primary">
                Track Application Now
              </a>
              <a routerLink="/login" class="btn btn-secondary">
                Go to Sign In
              </a>
            </div>
          </div>
        } @else {
          @if (errorMessage) {
            <div class="alert alert-error">
              {{ errorMessage }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="application-form">
            <h4 class="section-title">1. Personal & Contact Details</h4>
            <div class="grid-2">
              <div class="form-group">
                <label for="studentName">Student Full Name *</label>
                <input
                  id="studentName"
                  type="text"
                  name="studentName"
                  [(ngModel)]="form.studentName"
                  required
                  placeholder="Full Legal Name"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  [(ngModel)]="form.email"
                  required
                  placeholder="student@example.com"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="phone">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  [(ngModel)]="form.phone"
                  required
                  placeholder="10-digit mobile number"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="dob">Date of Birth *</label>
                <input
                  id="dob"
                  type="date"
                  name="dob"
                  [(ngModel)]="form.dateOfBirth"
                  required
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="gender">Gender *</label>
                <select id="gender" name="gender" [(ngModel)]="form.gender" required class="form-control">
                  <option value="" disabled selected>-- Select Gender --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label for="address">Residential Address *</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  [(ngModel)]="form.address"
                  required
                  placeholder="Street, City, Postal Code"
                  class="form-control"
                />
              </div>
            </div>

            <h4 class="section-title">2. Academic Admission Details</h4>
            <div class="grid-2">
              <div class="form-group">
                <label for="appliedClass">Applying For Class *</label>
                <select id="appliedClass" name="appliedClass" [(ngModel)]="form.appliedClass" required class="form-control">
                  <option value="" disabled selected>-- Select Class (1 to 10) --</option>
                  @for (cls of classes; track cls) {
                    <option [value]="cls">{{ cls }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label for="marks">Previous Marks / Percentage (%) *</label>
                <input
                  id="marks"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  name="marks"
                  [(ngModel)]="form.marksPercentage"
                  required
                  placeholder="e.g. 88.5"
                  class="form-control"
                />
              </div>

              <div class="form-group full-width">
                <label for="previousSchool">Previous School Name *</label>
                <input
                  id="previousSchool"
                  type="text"
                  name="previousSchool"
                  [(ngModel)]="form.previousSchool"
                  required
                  placeholder="Name of last attended school / institution"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading">
                {{ loading ? 'Submitting Application...' : 'Submit Application' }}
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 800px;
      margin: 2.5rem auto;
      padding: 0 1rem;
    }
    .form-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 2.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      margin-bottom: 2rem;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 1.25rem;
    }
    .academic-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 0.2rem 0.65rem;
      border-radius: 9999px;
      margin-bottom: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .account-tip {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #3b82f6;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #334155;
      margin-bottom: 1.5rem;
    }
    .account-tip a {
      color: #2563eb;
      font-weight: 600;
      text-decoration: underline;
    }
    .header h2 {
      margin: 0 0 0.4rem 0;
      color: #0f172a;
      font-size: 1.75rem;
    }
    .header p {
      margin: 0;
      color: #64748b;
      font-size: 0.95rem;
    }
    .section-title {
      color: #1e293b;
      font-size: 1.05rem;
      margin: 1.5rem 0 1rem 0;
      padding-bottom: 0.4rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.2rem;
    }
    @media (max-width: 640px) {
      .grid-2 {
        grid-template-columns: 1fr;
      }
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }
    .form-control {
      padding: 0.65rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: border-color 0.15s;
    }
    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    .form-actions {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
    }
    .submit-btn {
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 600;
    }
    .btn {
      border: none;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #334155;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
    }
    .btn-secondary:hover {
      background: #e2e8f0;
    }
    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 0.85rem 1.25rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
    .success-box {
      text-align: center;
      padding: 2rem 1rem;
    }
    .success-icon {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    .success-box h3 {
      color: #15803d;
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
    }
    .app-number-display {
      display: inline-block;
      font-family: monospace;
      font-size: 1.6rem;
      font-weight: 700;
      color: #1e3a8a;
      background: #eff6ff;
      border: 2px dashed #3b82f6;
      padding: 0.6rem 1.5rem;
      border-radius: 8px;
      margin: 1rem 0;
      letter-spacing: 0.05em;
    }
    .success-note {
      color: #64748b;
      max-width: 480px;
      margin: 0 auto 1.5rem auto;
      font-size: 0.95rem;
    }
    .success-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
  `]
})
export class RegisterComponent implements OnInit {
  classes = ALL_CLASSES;

  form: StudentRegistrationDto = {
    studentName: '',
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    appliedClass: '',
    previousSchool: '',
    marksPercentage: null as any
  };

  loading = false;
  errorMessage = '';
  successData: { success: boolean; applicationNumber: string } | null = null;

  constructor(
    private admissionService: AdmissionService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.currentUser;
      if (user) {
        this.form.email = user.email || '';
      }
    }
  }

  onSubmit(): void {
    if (!this.form.gender) {
      this.errorMessage = 'Please select a gender.';
      return;
    }
    if (!this.form.appliedClass) {
      this.errorMessage = 'Please select the class you are applying for.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      ...this.form,
      fullName: this.form.studentName || this.form.fullName,
      studentName: this.form.studentName || this.form.fullName,
      username: this.authService.currentUser?.username || undefined
    };

    this.admissionService.registerStudent(payload as any).subscribe({
      next: (res) => {
        this.loading = false;
        this.successData = res;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = parseApiError(err);
      }
    });
  }
}
