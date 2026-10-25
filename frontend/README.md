# Admission Portal - Angular Frontend

A lightweight, modern Single Page Application (SPA) built with standalone Angular components to replace server-side Thymeleaf rendering.

## Architecture

- **Port**: `4200` (`http://localhost:4200`)
- **API Target**: Spring Cloud Gateway on `http://localhost:8080`
- **Authentication**: Stateless Bearer JWT tokens issued by `auth-service` and verified at the Gateway.
- **Interceptors**: `authInterceptor` automatically attaches `Authorization: Bearer <token>` to downstream requests.

## Default Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin` | `admin123` |
| **Student** | `alice` | `student123` |

## Getting Started

1. Ensure the microservices are running:
   - `service-registry` (:8761)
   - `auth-service` (:8082)
   - `admission-service` (:8081)
   - `api-gateway` (:8080)
2. Start the Angular application:
   ```bash
   cd frontend
   npm start
   ```
3. Open `http://localhost:4200` in your browser.

## Features

- **Public Access**:
  - Track application status in real-time by application number (`/track`).
  - Online student application self-registration (`/register`).
  - Sign in card with quick autofill demo logins (`/login`).
- **Student Dashboard** (`/student`):
  - View real-time application status (Approved, Pending, Rejected).
  - Inspect permanent roll number and assigned class/section.
- **Admin Dashboard** (`/admin`):
  - Overview statistic cards (Total, Pending, Approved, Rejected).
  - Filterable applications table.
  - Approve applications with custom class and section assignment.
  - Reject applications with reasons.
  - Class & section enrollment reports.
