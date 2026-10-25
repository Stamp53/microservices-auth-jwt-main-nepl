# Controller to Service to Repository: Complete Flow Documentation (Fresher Level)

## Architecture Overview

```text
  CLIENT (Angular Frontend: Port 4200)
          |
          |  HTTP Requests (with Authorization: Bearer <JWT>)
          v
  [API GATEWAY : 8080]
     ├── Global Filter (JwtAuthenticationFilter)
     │     ├── Public routes (/auth/**, /register, /track) -> forward directly
     │     └── Protected routes -> Validates JWT signature with secret key
     │           └── Extracts username & role from JWT claims
     │           └── Injects headers: X-Auth-Username, X-Auth-Role
     │
     ├── Routes:
     │     ├── /auth/**  --> [AUTH-SERVICE : 8082]
     │     └── /**       --> [ADMISSION-SERVICE : 8081]
     │
     +-------------------+--------------------+
     |                                        |
     v                                        v
[AUTH-SERVICE : 8082]               [ADMISSION-SERVICE : 8081]
- User Registration                 - Reads X-Auth-Username & X-Auth-Role
- User Login & JWT Generation       - Admin Application Management
- JWT Token Validation (Stateless)   - Student Application Status
```

---

## 1. AUTH-SERVICE (Port 8082) - Identity Provider

The Auth Service has one simple job: **Issue and Validate JWT Tokens**. It is completely stateless.

### Repositories in auth-service:
- `UserRepository` -> Table: `users` (id, username, password, email, full_name, role, enabled, created_at)

---

### [A] POST /auth/login
**Purpose:** Verify user credentials and return a signed JWT token.

```text
AuthController.login(LoginRequest)
    │
    ├── [Validation] @Valid: username and password cannot be blank
    │
    └── AuthService.login(request)
            │
            ├── 1. UserRepository.findByUsername(username)  [DB READ]
            │       └── Throws BadCredentialsException if username not found
            │
            ├── 2. passwordEncoder.matches(rawPassword, user.getPassword())
            │       └── Throws BadCredentialsException if BCrypt hash does not match
            │
            ├── 3. JwtTokenProvider.generateAccessToken(username, role, email)
            │       └── Creates HMAC-SHA256 signed JWT
            │       └── Claims: sub (username), role, email, iat, exp (1 hour)
            │
            └── 4. Returns AuthResponse { accessToken, expiresIn: 3600, username, email, role }
```

---

### [B] POST /auth/register
**Purpose:** Register a new user account and immediately issue a JWT token.

```text
AuthController.register(RegisterRequest)
    │
    ├── [Validation] @Valid: username, password, email, fullName
    │
    └── AuthService.register(request)
            │
            ├── 1. UserRepository.existsByUsername(username)  [DB READ]
            ├── 2. UserRepository.existsByEmail(email)        [DB READ]
            │
            ├── 3. passwordEncoder.encode(rawPassword)
            │       └── Creates BCrypt hash of the password
            │
            ├── 4. UserRepository.save(newUser)               [DB WRITE]
            │
            ├── 5. JwtTokenProvider.generateAccessToken(...)
            │       └── Issues JWT immediately so user doesn't need to log in again
            │
            └── 6. Returns AuthResponse { accessToken, expiresIn: 3600, username, email, role }
```

---

### [C] POST /auth/validate
**Purpose:** Validate an existing token and return claims.

```text
AuthController.validateToken(TokenValidationRequest)
    │
    └── AuthService.validateToken(token)
            │
            ├── 1. JwtTokenProvider.validateToken(token)
            │       └── Checks signature & expiry
            │
            ├── 2. JwtTokenProvider.getClaimsFromToken(token)
            │       └── Extracts username, role, email
            │
            └── 3. Returns TokenValidationResponse { valid: true, username, role, email }
```

---

### [D] POST /auth/logout
**Purpose:** Stateless logout.
* Because JWT is stateless, the server does not hold session state.
* Client deletes `access_token` from `localStorage`.
* Endpoint simply returns `{ "success": true, "message": "Successfully logged out" }`.

---

## 2. API GATEWAY (Port 8080) - Security & Routing

The Gateway acts as the gatekeeper. Downstream services do **not** need to parse JWT strings.

```text
Incoming HTTP Request
    │
    ├── 1. Preflight CORS check (OPTIONS) -> Allow immediately
    │
    ├── 2. Public endpoint check (/auth/**, /register, /track) -> Allow immediately
    │
    └── 3. Protected endpoint:
            │
            ├── Reads Authorization: Bearer <token>
            │
            ├── Verifies HMAC-SHA256 signature using shared secret
            │
            ├── If INVALID / EXPIRED:
            │       └── Returns HTTP 401 Unauthorized (JSON)
            │
            └── If VALID:
                    ├── Extracts claims: username & role
                    ├── Mutates request headers:
                    │       X-Auth-Username: <username>
                    │       X-Auth-Role: <role>
                    └── Forwards request to downstream service
```

---

## 3. ADMISSION-SERVICE (Port 8081) - Business Logic

Admission-service trusts the headers forwarded by the API Gateway.

```text
Request arrives from Gateway (with X-Auth-Username and X-Auth-Role)
    │
    └── JwtAuthenticationFilter
            │
            ├── Reads X-Auth-Username and X-Auth-Role
            │
            └── Sets SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(username, null, authorities)
                )
```

Now Spring Security knows who the user is without querying any user table or parsing any JWT!

### Endpoints in admission-service:
* **Public:**
  * `POST /register` -> Student self-registration (creates application & local student account)
  * `GET /track?appNum=...` -> Track application status
* **Student (`ROLE_STUDENT`):**
  * `GET /student/dashboard` -> Returns student profile & application status
* **Admin (`ROLE_ADMIN`):**
  * `GET /admin/dashboard` -> Summary stats (total, pending, approved, rejected)
  * `GET /admin/applications` -> Filter applications by status
  * `GET /admin/applications/{id}` -> View details of an application
  * `POST /admin/applications/{id}/approve` -> Approve with class & section
  * `POST /admin/applications/{id}/reject` -> Reject with remarks
  * `GET /admin/reports` -> Class & section reports

---

## 4. Default Seed Users (For Demonstrations & Viva)

Both `auth-service` and `admission-service` are pre-seeded with the exact same 3 test users:

| Username | Password | Role | Description |
|---|---|---|---|
| `admin` | `admin123` | `ROLE_ADMIN` | System Administrator (Full Access) |
| `alice` | `student123` | `ROLE_STUDENT` | Student (Approved Application) |
| `bob` | `student123` | `ROLE_STUDENT` | Student (Pending Application) |
