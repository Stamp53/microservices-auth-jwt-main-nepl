import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { RegisterComponent } from './pages/register/register.component';
import { TrackComponent } from './pages/track/track.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { StudentDashboardComponent } from './pages/student/student-dashboard.component';
import { adminGuard, studentGuard, homeGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', canActivate: [homeGuard], component: LoginComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'track', component: TrackComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'student', component: StudentDashboardComponent, canActivate: [studentGuard] },
  { path: '**', canActivate: [homeGuard], component: LoginComponent }
];
