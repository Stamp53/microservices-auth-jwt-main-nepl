package com.example.auth;

import com.example.auth.model.Role;
import com.example.auth.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(tokenProvider, "accessTokenExpirationMs", 3600000L);
        ReflectionTestUtils.setField(tokenProvider, "refreshTokenExpirationMs", 604800000L);
    }

    @Test
    void testGenerateAndValidateAccessToken() {
        String token = tokenProvider.generateAccessToken("testuser", Role.ROLE_STUDENT, "test@example.com");
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("testuser", tokenProvider.getUsernameFromToken(token));
        assertEquals("ROLE_STUDENT", tokenProvider.getRoleFromToken(token));
        assertEquals("test@example.com", tokenProvider.getEmailFromToken(token));
    }

    @Test
    void testInvalidToken() {
        assertFalse(tokenProvider.validateToken("invalid.token.here"));
    }
}
