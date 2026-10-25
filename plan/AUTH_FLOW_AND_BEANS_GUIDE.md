# Complete Authentication & Authorization Flow: Beans, Objects & Code Walkthrough

This document provides a comprehensive, component-by-component, bean-by-bean explanation of the entire Authentication and Authorization (JWT) architecture across the microservices ecosystem.

---

## 1. High-Level Architectural Flow

```
+--------------------------------------------------------------------------------------------------+
|                                    1. USER BROWSER (Angular 18)                                  |
|                                                                                                  |
|   +-------------------+    +--------------------+    +------------------+    +---------------+   |
|   |  SignupComponent  |    |   LoginComponent   |    | authInterceptor  |    |   authGuard   |   |
|   +---------+---------+    +---------+----------+    +--------+---------+    +-------+-------+   |
+-------------|------------------------|------------------------|----------------------|-----------+
              | POST /auth/register    | POST /auth/login       | Bearer <JWT>         | Checks Role
              v                        v                        v                      v
+--------------------------------------------------------------------------------------------------+
|                                   2. API GATEWAY (Port 8080)                                     |
|                                                                                                  |
|   [ JwtAuthenticationFilter ]                                                                    |
|   - Bypasses public routes (/auth/**, /register, /track)                                         |
|   - Validates HMAC-SHA256 signature on Bearer token                                              |
|   - Decodes claims (username, role, email)                                                       |
|   - Mutates request -> Injects headers:                                                          |
|       * X-Auth-Username: <username>                                                              |
|       * X-Auth-Role: <role>                                                                      |
+--------------------------------------+-----------------------------------------------------------+
                                       |
                   +-------------------+--------------------+
                   | Routes via Eureka                      | Routes via Eureka
                   v                                        v
+----------------------------------------+ +-------------------------------------------------------+
|        3. AUTH-SERVICE (Port 8082)     | |              4. ADMISSION-SERVICE (Port 8081)         |
|                                        | |                                                       |
|  [ SecurityConfig ] (Permits /auth/**) | |  [ SecurityConfig ] (RBAC & Stateless Session)        |
|  [ AuthController ] (/auth/login, etc) | |  [ JwtAuthenticationFilter ] (Reads X-Auth-Headers)  |
|  [ AuthService ] (Verify & Issue JWT)  | |  [ SecurityContextHolder ] (Sets Authentication)      |
|  [ JwtTokenProvider ] (Jwts.builder)   | |  [ AdminController / StudentController ] (Secured)   |
|  [ UserRepository ] (Database: authdb) | |                                                       |
+----------------------------------------+ +-------------------------------------------------------+
```

---

## 2. Service 1: `auth-service` (Authentication & Identity Provider)

The `auth-service` is the central Identity Provider (IdP). Its sole responsibility is **user identity management** (Sign Up, Sign In, Password Hashing, and JWT Generation/Validation).

### A. [SecurityConfig.java](file:///c:/Users/abhis/Desktop/Final%20jwt/microservices-auth-jwt-main/microservices-auth-jwt-main/auth-service/src/main/java/com/example/auth/config/SecurityConfig.java)
- **Spring Annotations:**
  - `@Configuration`: Marks this class as a Spring configuration file that declares Spring Beans.
  - `@EnableWebSecurity`: Activates Spring Security's web security support.
- **Bean 1: `PasswordEncoder passwordEncoder()`**
  - **Returned Instance:** `new BCryptPasswordEncoder()`
  - **Responsibility:** Implements a strong, one-way adaptive cryptographic hashing algorithm with salt (BCrypt).
  - **How it works:**
    - When a user signs up, `passwordEncoder.encode("myPassword")` produces a 60-character bcrypt hash (e.g., `$2a$10$e8w...`).
    - When a user logs in, `passwordEncoder.matches(rawPassword, hashedPassword)` compares the plaintext input against the salted hash without ever decrypting it.
- **Bean 2: `SecurityFilterChain filterChain(HttpSecurity http)`**
  - **Responsibility:** Configures HTTP security rules for incoming requests to `auth-service`.
  - **Key settings:**
    - `.csrf(csrf -> csrf.disable())`: Disables CSRF protection because JWT authentication is stateless and uses request headers rather than session cookies.
    - `.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))`: Prevents Spring Security from creating or storing HTTP sessions in memory.
    - `.authorizeHttpRequests(...)`: Permits all traffic matching `/auth/**`, `/h2-console/**`, and `/actuator/**` without requiring an existing login.
    - `.headers(headers -> headers.frameOptions(frame -> frame.disable()))`: Allows the H2 database console UI to render inside an iframe for development inspection.

---

### B. [JwtTokenProvider.java](file:///c:/Users/abhis/Desktop/Final%20jwt/microservices-auth-jwt-main/microservices-auth-jwt-main/auth-service/src/main/java/com/example/auth/security/JwtTokenProvider.java)
- **Spring Annotations:**
  - `@Component`: Registers this class as an injectable Spring-managed singleton component.
- **Properties:**
  - `@Value("${app.jwt.secret}") private String jwtSecret`: Injected 256-bit hexadecimal secret key shared with the Gateway.
  - `@Value("${app.jwt.access-token-expiration-ms:3600000}") private long accessTokenExpirationMs`: Token TTL (1 hour = 3600 seconds).
- **Methods & Responsibilities:**
  1. `private SecretKey getSigningKey()`:
     - Converts the string secret into a cryptographically secure `SecretKey` using `Keys.hmacShaKeyFor(...)`.
  2. `public String generateAccessToken(String username, Role role, String email)`:
     - Uses `Jwts.builder()` to assemble:
       - **Header:** Algorithm (HMAC-SHA256) and Type (JWT).
       - **Claims (Payload):**
         - `sub` (Subject): the `username`
         - `role`: string name (`ROLE_STUDENT` or `ROLE_ADMIN`)
         - `email`: user's email address
         - `iat` (Issued At): timestamp
         - `exp` (Expiration): timestamp + 1 hour
       - **Signature:** Signed using `signWith(getSigningKey())`.
     - Returns the compacted Base64URL string: `header.payload.signature`.
  3. `public Claims getClaimsFromToken(String token)`:
     - Parses the signed JWT, verifies the HMAC signature using the SecretKey, checks expiry, and unpacks payload claims. If tampered with or expired, it throws an exception.
  4. `public boolean validateToken(String token)`:
     - Helper method returning `true` if valid, or `false` on any parsing or signature failure.

---

### C. [AuthService.java](file:///c:/Users/abhis/Desktop/Final%20jwt/microservices-auth-jwt-main/microservices-auth-jwt-main/auth-service/src/main/java/com/example/auth/service/AuthService.java)
- **Spring Annotations:**
  - `@Service`: Marks this class as a Spring business service layer bean.
- **Injected Dependencies:**
  - `UserRepository userRepository`
  - `PasswordEncoder passwordEncoder`
  - `JwtTokenProvider tokenProvider`
- **Methods & Responsibilities:**
  1. `public AuthResponse register(RegisterRequest request)`:
     - Checks whether `username` or `email` already exists in `authdb`. Throws `IllegalArgumentException` if duplicated.
     - Hashes the plain-text password using `passwordEncoder.encode(request.getPassword())`.
     - Saves the new `User` entity to the database with role `ROLE_STUDENT`.
     - Generates a fresh JWT using `tokenProvider.generateAccessToken(...)`.
     - Returns an `AuthResponse` containing the token, user details, and expiration.
  2. `public AuthResponse login(LoginRequest request)`:
     - Looks up user by `username` in `userRepository`.
     - Compares submitted password with hashed password via `passwordEncoder.matches(...)`.
     - If matched, generates a fresh JWT token with claims and returns `AuthResponse`.
     - If invalid, throws `BadCredentialsException("Invalid username or password")`.
  3. `public TokenValidationResponse validateToken(String token)`:
     - Used by internal verification endpoints to inspect token claims.

---

### D. [AuthController.java](file:///c:/Users/abhis/Desktop/Final%20jwt/microservices-auth-jwt-main/microservices-auth-jwt-main/auth-service/src/main/java/com/example/auth/controller/AuthController.java)
- **Spring Annotations:**
  - `@RestController`: Combines `@Controller` and `@ResponseBody`, serializing return values directly to JSON.
  - `@RequestMapping("/auth")`: Base path mapping for all authentication endpoints.
- **Endpoints & Responsibilities:**
  - `POST /auth/register`: Validates incoming DTO via `@Valid @RequestBody RegisterRequest request`. Calls `authService.register()`, returns HTTP 201 Created or HTTP 400 Bad Request with clean error JSON.
  - `POST /auth/login`: Validates `LoginRequest`. Calls `authService.login()`, returns HTTP 200 OK with token or HTTP 401 Unauthorized on bad credentials.
  - `POST /auth/validate`: Validates token validity and returns claims.
  - `POST /auth/logout`: Stateless acknowledgement; client discards token from storage.

---

## 3. Service 2: `api-gateway` (Edge Gateway & Perimeter Security)

The API Gateway is the **single entry point** for all client traffic (Port 8080). It runs on Spring Cloud Gateway (reactive Netty stack).

### [JwtAuthenticationFilter.java](file:///c:/Users/abhis/Desktop/Final%20jwt/microservices-auth-jwt-main/microservices-auth-jwt-main/api-gateway/src/main/java/com/example/gateway/filter/JwtAuthenticationFilter.java)
- **Spring Annotations & Interfaces:**
  - `@Component`: Registered as a Spring Bean.
  - `implements GlobalFilter, Ordered`: Runs on **every** request that flows through the gateway before it is routed downstream.
- **Key Responsibilities:**
  1. **Preflight Pass-Through:**
     - Immediately passes HTTP `OPTIONS` requests through without blocking so browser CORS handshakes succeed.
  2. **Public Endpoint Bypass:**
     - Whitelist endpoints (`/auth/**`, `/register`, `/track/**`, `/h2-console/**`, etc.) bypass JWT verification.
  3. **Perimeter Token Verification:**
     - Reads the `Authorization` header (`Bearer <token>`).
     - Decodes and verifies the HMAC-SHA256 signature against `jwtSecret`.
     - If the signature is invalid or the token expired, intercepts immediately and returns HTTP 401 Unauthorized via `onError(...)`.
  4. **Identity Header Propagation (Downstream Enrichment):**
     - Once verified, extracts `claims.getSubject()` (username) and `claims.get("role")`.
     - Uses `request.mutate()` to inject two trusted HTTP headers:
       - `X-Auth-Username: <username>`
       - `X-Auth-Role: <role>`
     - Downstream microservices do **not** need to re-parse or re-verify the JWT cryptographic signature; they trust the gateway perimeter and read these two headers!

---

## 4. Service 3: `admission-service` (Business Microservice & RBAC)

The `admission-service` manages student admission applications, admin evaluations, and section assignments.

### A. [SecurityConfig.java](file:///c:/Users/abhis/Desktop/Final%20jwt/microservices-auth-jwt-main/microservices-auth-jwt-main/admission-service/src/main/java/com/example/admission/config/SecurityConfig.java)
- **Spring Annotations:**
  - `@Configuration`, `@EnableWebSecurity`
- **Beans & Configuration:**
  - `PasswordEncoder passwordEncoder()`: Injects `BCryptPasswordEncoder` for hashing.
  - `SecurityFilterChain filterChain(HttpSecurity http)`:
    - Sets `SessionCreationPolicy.STATELESS` (no sessions).
    - Configures fine-grained **Role-Based Access Control (RBAC)**:
      - `.requestMatchers("/register", "/track", "/track/**").permitAll()`: Anyone can apply or track an application.
      - `.requestMatchers("/admin/**").hasRole("ADMIN")`: Strictly restricted to administrators.
      - `.requestMatchers("/student/**").hasRole("STUDENT")`: Restricted to logged-in students.
      - `.anyRequest().authenticated()`: Any other endpoint requires an authenticated identity.
    - `.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)`: Registers the gateway header extractor before Spring Security's standard filter.

---

### B. [JwtAuthenticationFilter.java (Admission)](file:///c:/Users/abhis/Desktop/Final%20jwt/microservices-auth-jwt-main/microservices-auth-jwt-main/admission-service/src/main/java/com/example/admission/security/JwtAuthenticationFilter.java)
- **Spring Annotations:**
  - `@Component`, `extends OncePerRequestFilter`
- **How it works:**
  - Reads `request.getHeader("X-Auth-Username")` and `request.getHeader("X-Auth-Role")` forwarded by the Gateway.
  - If both exist, it creates a `SimpleGrantedAuthority(role)` and instantiates:
    ```java
    var auth = new UsernamePasswordAuthenticationToken(username, null, authorities);
    SecurityContextHolder.getContext().setAuthentication(auth);
    ```
  - Spring Security now knows exactly who is making the request (`authentication.getName()`) and what their roles are (`ROLE_ADMIN` or `ROLE_STUDENT`), enabling annotations like `@PreAuthorize` or `hasRole(...)` to function seamlessly.

---

## 5. Client Layer: Angular 18 Frontend

The frontend handles user interactions and manages auth state.

### A. [auth.service.ts](file:///c:/Users/abhis/Desktop/Final%20jwt/microservices-auth-jwt-main/microservices-auth-jwt-main/frontend/src/app/services/auth.service.ts)
- **Angular Annotation:** `@Injectable({ providedIn: 'root' })` (Application-wide singleton).
- **Responsibilities:**
  - Holds active session in `BehaviorSubject<AuthUser | null>`.
  - Persists and retrieves the JWT in browser `localStorage` (`localStorage.setItem('auth_token', token)`).
  - Exposes reactive stream `currentUser$` and helper methods: `isAdmin()`, `isStudent()`, `isAuthenticated()`.
  - `login(...)`: Sends credentials to Gateway `/auth/login`, saves returned JWT token and user profile.
  - `signup(...)`: Sends registration data to Gateway `/auth/register`.
  - `logout()`: Clears `localStorage` and emits `null`.

---

### B. [auth.interceptor.ts](file:///c:/Users/abhis/Desktop/Final%20jwt/microservices-auth-jwt-main/microservices-auth-jwt-main/frontend/src/app/interceptors/auth.interceptor.ts)
- **Angular Mechanism:** `HttpInterceptorFn`
- **Responsibility:**
  - Automatically intercepts **every** outgoing HTTP request made by Angular's `HttpClient`.
  - If a JWT is stored in `AuthService`, clones the HTTP request and attaches:
    ```typescript
    Authorization: `Bearer ${token}`
    ```
  - This guarantees the API Gateway always receives the token on protected requests without developers manually setting headers in every component.

---

### C. [auth.guard.ts](file:///c:/Users/abhis/Desktop/Final%20jwt/microservices-auth-jwt-main/microservices-auth-jwt-main/frontend/src/app/guards/auth.guard.ts)
- **Angular Mechanism:** `CanActivateFn`
- **Responsibility:**
  - Guard checks before navigating to protected routes (e.g., `/admin`, `/student/dashboard`).
  - If not logged in, immediately redirects to `/login` with a return URL.
  - If logged in but lacking the required role (e.g., a student trying to access `/admin`), denies access and redirects appropriately.

---

## 6. Summary: Bean and Object Responsibility Matrix

| Module | Object / Bean | Type | Core Responsibility |
| :--- | :--- | :--- | :--- |
| **auth-service** | `SecurityConfig` | `@Configuration` | Configures stateless policy & creates `PasswordEncoder` and filter chain. |
| **auth-service** | `BCryptPasswordEncoder` | `@Bean` | One-way hashing of passwords with random salts. |
| **auth-service** | `JwtTokenProvider` | `@Component` | Issues signed JWTs with claims; verifies signatures & parses payloads. |
| **auth-service** | `AuthService` | `@Service` | Validates credentials, creates user accounts, coordinates token issuance. |
| **auth-service** | `AuthController` | `@RestController` | Exposes REST endpoints (`/auth/login`, `/auth/register`) to clients. |
| **api-gateway** | `JwtAuthenticationFilter` | `GlobalFilter` | Gateway filter; validates JWT signature, injects `X-Auth-Username` & `X-Auth-Role`. |
| **admission-service** | `SecurityConfig` | `@Configuration` | Enforces RBAC (`/admin/**` vs `/student/**`), stateless session policy. |
| **admission-service** | `JwtAuthenticationFilter` | `OncePerRequestFilter` | Reads `X-Auth-Username` / `X-Auth-Role` headers, sets `SecurityContextHolder`. |
| **admission-service** | `ApplicationService` | `@Service` | Processes academic admission applications decoupled from auth credentials. |
| **frontend** | `AuthService` | `@Injectable` | Manages auth state, tokens in `localStorage`, login, signup, logout. |
| **frontend** | `authInterceptor` | `HttpInterceptorFn` | Appends `Authorization: Bearer <token>` to all outgoing HTTP requests. |
| **frontend** | `authGuard` | `CanActivateFn` | Client-side route protection based on authentication state and user roles. |
