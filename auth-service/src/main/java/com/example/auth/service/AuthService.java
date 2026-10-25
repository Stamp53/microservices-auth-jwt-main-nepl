package com.example.auth.service;

import com.example.auth.dto.*;
import com.example.auth.model.Role;
import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import com.example.auth.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(LoginRequest request) {
        String username = request.getUsername().trim();

        // 1. Look up the user in the database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        // 2. Verify password with BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        // 3. Generate stateless JWT access token
        String accessToken = tokenProvider.generateAccessToken(user.getUsername(), user.getRole(), user.getEmail());

        return new AuthResponse(
                accessToken,
                tokenProvider.getAccessTokenExpirationSeconds(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );
    }

    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username '" + username + "' is already taken");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email '" + email + "' is already registered");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_STUDENT;

        // Create new user with encrypted password
        User user = new User(
                username,
                passwordEncoder.encode(request.getPassword()),
                email,
                request.getFullName().trim(),
                role
        );
        userRepository.save(user);

        // Generate JWT token immediately so user is logged in
        String accessToken = tokenProvider.generateAccessToken(user.getUsername(), user.getRole(), user.getEmail());

        return new AuthResponse(
                accessToken,
                tokenProvider.getAccessTokenExpirationSeconds(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );
    }

    public TokenValidationResponse validateToken(String token) {
        if (!tokenProvider.validateToken(token)) {
            return TokenValidationResponse.invalid("Invalid or expired JWT token");
        }

        try {
            Claims claims = tokenProvider.getClaimsFromToken(token);
            String username = claims.getSubject();
            String roleStr = claims.get("role", String.class);
            String email = claims.get("email", String.class);
            Role role = Role.valueOf(roleStr);

            return TokenValidationResponse.valid(username, role, email);
        } catch (Exception ex) {
            return TokenValidationResponse.invalid("Could not extract token claims: " + ex.getMessage());
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteUserByUsername(String username) {
        userRepository.findByUsername(username).ifPresent(userRepository::delete);
    }
}
