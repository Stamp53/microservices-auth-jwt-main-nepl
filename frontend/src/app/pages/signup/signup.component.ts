import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { parseApiError } from '../../utils/error.util';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="card-header">
          <div class="header-icon">✨</div>
          <h2>Create Your Account</h2>
          <p>Sign up to access your student portal and track admissions</p>
        </div>

        @if (errorMessage) {
          <div class="alert alert-error">
            {{ errorMessage }}
          </div>
        }

        @if (successMessage) {
          <div class="alert alert-success">
            {{ successMessage }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              [(ngModel)]="fullName"
              placeholder="e.g. John Doe"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="username">Username *</label>
            <input
              id="username"
              type="text"
              name="username"
              [(ngModel)]="username"
              placeholder="Choose a username (min 3 chars)"
              required
              minlength="3"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="email">Email Address *</label>
            <input
              id="email"
              type="email"
              name="email"
              [(ngModel)]="email"
              placeholder="e.g. john@example.com"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="password">Password *</label>
            <input
              id="password"
              type="password"
              name="password"
              [(ngModel)]="password"
              placeholder="At least 6 characters"
              required
              minlength="6"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              placeholder="Re-enter your password"
              required
              class="form-control"
            />
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Creating Account...' : 'Sign Up' }}
          </button>
        </form>

        <div class="card-footer">
          <p>Already have an account? <a routerLink="/login">Sign In</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
    }
    .auth-card {
      width: 100%;
      max-width: 460px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 2.25rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .card-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .header-icon {
      font-size: 2rem;
      margin-bottom: 0.25rem;
    }
    .card-header h2 {
      margin: 0 0 0.4rem 0;
      font-size: 1.6rem;
      font-weight: 700;
      color: #0f172a;
    }
    .card-header p {
      margin: 0;
      color: #64748b;
      font-size: 0.9rem;
    }
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
    }
    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
    }
    .alert-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }
    .form-control {
      width: 100%;
      box-sizing: border-box;
      padding: 0.65rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .form-control:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    .btn-primary {
      background: #2563eb;
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
      transition: background 0.15s;
    }
    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }
    .btn-primary:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    .card-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: #64748b;
    }
    .card-footer p {
      margin: 0.35rem 0;
    }
    .card-footer a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }
    .card-footer a:hover {
      text-decoration: underline;
    }
    .divider {
      position: relative;
      margin: 1rem 0;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
      line-height: 0.1em;
    }
    .divider span {
      background: #fff;
      padding: 0 0.5rem;
      color: #94a3b8;
      font-size: 0.8rem;
      text-transform: uppercase;
    }
    .secondary-action {
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: #475569;
    }
  `]
})
export class SignupComponent implements OnInit {
  fullName = '';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/student']);
      }
    }
  }

  onSubmit(): void {
    if (!this.fullName || !this.username || !this.email || !this.password) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    if (this.username.trim().length < 3) {
      this.errorMessage = 'Username must be at least 3 characters.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService
      .signup({
        fullName: this.fullName.trim(),
        username: this.username.trim(),
        email: this.email.trim(),
        password: this.password
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.successMessage = 'Account created successfully! Redirecting...';
          setTimeout(() => {
            if (res.role === 'ROLE_ADMIN') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/student']);
            }
          }, 800);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = parseApiError(err);
        }
      });
  }
}
