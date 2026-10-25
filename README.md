# Admission Management System - Microservices Architecture (Fresher Level)

A clean, beginner-friendly microservices-based Admission Management System demonstrating **JWT (JSON Web Token) stateless authentication** with **Spring Boot 3**, **Spring Cloud Gateway**, **Netflix Eureka**, and an **Angular Frontend**.

---

## 🏛️ Architecture Overview

The system consists of 4 backend microservices and 1 Angular frontend:

```text
       Angular Frontend (Port 4200)
                  │
                  ▼
         API Gateway (Port 8080)
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
  Auth Service      Admission Service
  (Port 8082)          (Port 8081)
        ▲                   ▲
        └─────────┬─────────┘
                  │
          Service Registry
          (Eureka: 8761)
```

1. **Service Registry (`service-registry`) - Port 8761**:
   - Netflix Eureka Server for service discovery and instance registration.

2. **API Gateway (`api-gateway`) - Port 8080**:
   - Single entry point for all frontend requests.
   - Validates JWT tokens using HMAC-SHA256 and extracts claims (`username`, `role`).
   - Injects identity headers (`X-Auth-Username`, `X-Auth-Role`) for downstream microservices.

3. **Auth Service (`auth-service`) - Port 8082**:
   - Dedicated JWT Authentication Server.
   - Generates and signs stateless JWT tokens upon login or registration.
   - Provides a token validation endpoint (`/auth/validate`).

4. **Admission Service (`admission-service`) - Port 8081**:
   - Business service handling student applications and admin decisions.
   - Simply reads `X-Auth-Username` and `X-Auth-Role` headers passed by the API Gateway.
   - No JWT parsing needed here—delegated entirely to the API Gateway.

5. **Frontend (`frontend`) - Port 4200**:
   - Clean Angular single-page application.
   - Stores JWT in browser `localStorage`.
   - Attaches `Authorization: Bearer <token>` to requests.

---

## 🚀 Running the Project

### Prerequisites
- Java 17+
- Node.js 18+ & npm
- Maven 3.8+

### Step 1: Start Backend Services (in order)
Start each service in a separate terminal:

1. **Service Registry**:
   ```bash
   cd service-registry
   mvn spring-boot:run
   ```
2. **Auth Service**:
   ```bash
   cd auth-service
   mvn spring-boot:run
   ```
3. **Admission Service**:
   ```bash
   cd admission-service
   mvn spring-boot:run
   ```
4. **API Gateway**:
   ```bash
   cd api-gateway
   mvn spring-boot:run
   ```

### Step 2: Start Angular Frontend
```bash
cd frontend
npm start
```
Open **http://localhost:4200** in your browser.

---

## 🌐 URLs & Access Points

| Component | URL | Description |
|---|---|---|
| **Angular Web App** | `http://localhost:4200` | Student & Admin Portal |
| **API Gateway (Main Backend Entry)** | `http://localhost:8080` | Reverse proxy and JWT entry point |
| **Eureka Registry Dashboard** | `http://localhost:8761` | Microservices discovery dashboard |
| **Auth H2 Console** | `http://localhost:8082/h2-console` | JDBC: `jdbc:h2:file:./data/authdb` |
| **Admission H2 Console** | `http://localhost:8081/h2-console` | JDBC: `jdbc:h2:file:./data/admissiondb` |

---

## 🔑 Demo Credentials

| Username | Password | Role | Description |
|---|---|---|---|
| `admin` | `admin123` | `ROLE_ADMIN` | Full admin privileges (approve/reject/view applications) |
| `alice` | `student123` | `ROLE_STUDENT` | Student account with an approved application |
| `bob` | `student123` | `ROLE_STUDENT` | Student account with a pending application |

---

## 🔐 Auth Server API Endpoints

All endpoints are reachable via the Gateway (`http://localhost:8080/auth/...`) or directly (`http://localhost:8082/auth/...`).

### 1. Login & Get JWT Token
* **POST** `/auth/login`
* **Request:**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
* **Response:**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "expiresIn": 3600,
    "username": "admin",
    "email": "admin@admission.com",
    "role": "ROLE_ADMIN"
  }
  ```

### 2. User Registration
* **POST** `/auth/register`
* **Request:**
  ```json
  {
    "username": "john",
    "password": "password123",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "ROLE_STUDENT"
  }
  ```

### 3. Validate Token
* **POST** `/auth/validate`
* **Request:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
  ```
* **Response:**
  ```json
  {
    "valid": true,
    "username": "admin",
    "role": "ROLE_ADMIN",
    "email": "admin@admission.com",
    "message": "Token is valid"
  }
  ```

### 4. Logout
* **POST** `/auth/logout`
* In stateless JWT, logout happens when the client removes the token from `localStorage`.
