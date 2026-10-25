import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="card-header">
          <h2>Sign In</h2>
          <p>Access your student or administrator account</p>
        </div>

        @if (errorMessage) {
          <div class="alert alert-error">
            {{ errorMessage }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              [(ngModel)]="username"
              placeholder="Enter your username"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              [(ngModel)]="password"
              placeholder="Enter your password"
              required
              class="form-control"
            />
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <div class="quick-credentials">
          <p class="quick-title">Quick Demo Login:</p>
          <div class="quick-buttons">
            <button type="button" (click)="fillAdmin()" class="btn-chip admin-chip">
              Admin Login: admin / admin123
            </button>
          </div>
        </div>

        <div class="card-footer">
          <p class="signup-prompt">
            Don't have an account? <a routerLink="/signup" class="link-signup">Create an Account (Sign Up)</a>
          </p>
          <p><a routerLink="/track">Track existing application</a></p>
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
      padding: 2rem 1rem;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 2.25rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .card-header {
      text-align: center;
      margin-bottom: 1.75rem;
    }
    .card-header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.6rem;
      font-weight: 700;
      color: #0f172a;
    }
    .card-header p {
      margin: 0;
      color: #64748b;
      font-size: 0.9rem;
    }
    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
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
    .quick-credentials {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #f1f5f9;
    }
    .quick-title {
      margin: 0 0 0.5rem 0;
      font-size: 0.775rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .quick-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .btn-chip {
      background: white;
      border: 1px solid #e2e8f0;
      padding: 0.4rem 0.6rem;
      border-radius: 6px;
      font-size: 0.8rem;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s;
      color: #334155;
    }
    .btn-chip:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    .card-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.85rem;
      color: #64748b;
    }
    .card-footer p {
      margin: 0.4rem 0;
    }
    .card-footer a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
    }
    .card-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

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
    if (!this.username || !this.password) {
      this.errorMessage = 'Please provide both username and password';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.role === 'ROLE_ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/student']);
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password.';
        } else {
          this.errorMessage = 'Login failed: ' + (err.error?.message || err.message || 'Server error');
        }
      }
    });
  }

  fillAdmin(): void {
    this.username = 'admin';
    this.password = 'admin123';
  }

  fillStudent(): void {
    this.username = 'alice';
    this.password = 'student123';
  }
}
