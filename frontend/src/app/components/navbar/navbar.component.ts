import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="nav-container">
        <a [routerLink]="brandDestination" class="brand">
          <span class="brand-icon">🎓</span>
          <span class="brand-text">Admission<span class="brand-accent">Portal</span></span>
        </a>

        <nav class="nav-links">
          <a routerLink="/track" routerLinkActive="active" class="nav-item">Track Application</a>

          <!-- Public links -->
          @if (!authService.isLoggedIn()) {
            <a routerLink="/login" routerLinkActive="active" class="nav-item nav-signin">Sign In</a>
            <a routerLink="/signup" routerLinkActive="active" class="btn-signup">Sign Up</a>
          }

          <!-- Admin links -->
          @if (authService.isLoggedIn() && authService.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active" class="nav-item">Admin Dashboard</a>
          }

          <!-- Student links -->
          @if (authService.isLoggedIn() && authService.isStudent()) {
            <a routerLink="/student" routerLinkActive="active" class="nav-item">My Dashboard</a>
            <a routerLink="/register" routerLinkActive="active" class="nav-item">Apply for Admission</a>
          }

          <!-- User session badge & logout -->
          @if (authService.isLoggedIn()) {
            <div class="user-badge">
              <span class="role-tag" [class.admin]="authService.isAdmin()">
                {{ authService.isAdmin() ? 'ADMIN' : 'STUDENT' }}
              </span>
              <span class="username">{{ authService.currentUser?.username }}</span>
            </div>
            <button (click)="logout()" class="btn-logout">Logout</button>
          }
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
    }
    .brand-icon {
      font-size: 1.5rem;
    }
    .brand-accent {
      color: #2563eb;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .nav-item {
      text-decoration: none;
      color: #475569;
      font-weight: 500;
      font-size: 0.925rem;
      transition: color 0.15s ease;
    }
    .nav-item:hover, .nav-item.active {
      color: #2563eb;
    }
    .nav-signin {
      padding: 0.45rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
    }
    .nav-signin:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }
    .btn-signup {
      text-decoration: none;
      background: #2563eb;
      color: #ffffff;
      padding: 0.5rem 1.15rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.15s;
    }
    .btn-signup:hover {
      background: #1d4ed8;
    }
    .user-badge {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: #f1f5f9;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.85rem;
    }
    .role-tag {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      background: #3b82f6;
      color: white;
    }
    .role-tag.admin {
      background: #7c3aed;
    }
    .username {
      font-weight: 600;
      color: #1e293b;
    }
    .btn-logout {
      background: transparent;
      border: 1px solid #cbd5e1;
      color: #64748b;
      padding: 0.4rem 0.85rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-logout:hover {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #b91c1c;
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  get brandDestination(): string {
    if (this.authService.isLoggedIn()) {
      return this.authService.isAdmin() ? '/admin' : '/student';
    }
    return '/login';
  }

  logout(): void {
    this.authService.logout();
  }
}
