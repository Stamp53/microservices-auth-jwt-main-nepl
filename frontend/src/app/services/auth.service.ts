import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, SignupRequest } from '../models';

export interface UserSession {
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_URL = 'http://localhost:8080/auth';

  currentUser: UserSession | null = this.loadStoredUser();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.AUTH_URL}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.accessToken);
        const session: UserSession = {
          username: response.username,
          email: response.email,
          role: response.role
        };
        localStorage.setItem('user_session', JSON.stringify(session));
        this.currentUser = session;
      })
    );
  }

  signup(data: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.AUTH_URL}/register`, data).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.accessToken);
        const session: UserSession = {
          username: response.username,
          email: response.email,
          role: response.role
        };
        localStorage.setItem('user_session', JSON.stringify(session));
        this.currentUser = session;
      })
    );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      // Best-effort logout notification to auth-service
      this.http.post(`${this.AUTH_URL}/logout`, {}).subscribe({
        error: () => {} // ignore error on logout
      });
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_session');
    this.currentUser = null;
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUser;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ROLE_ADMIN';
  }

  isStudent(): boolean {
    return this.currentUser?.role === 'ROLE_STUDENT';
  }

  private loadStoredUser(): UserSession | null {
    const stored = localStorage.getItem('user_session');
    if (stored) {
      try {
        return JSON.parse(stored) as UserSession;
      } catch {
        return null;
      }
    }
    return null;
  }
}
