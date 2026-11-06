
package com.shopkart.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();
        String header = request.getHeader("Authorization");

        log.info("========== JWT DIAGNOSTIC ==========");
        log.info("REQUEST: {} {}", method, uri);
        log.info("AUTHORIZATION HEADER PRESENT: {}", header != null);
        log.info("BEARER TOKEN PRESENT: {}",
                header != null && header.startsWith("Bearer "));

        if (header == null || !header.startsWith("Bearer ")) {
            log.warn("JWT MISSING - request has no Bearer token");
            filterChain.doFilter(request, response);
            log.info("RESPONSE STATUS: {}", response.getStatus());
            return;
        }

        String token = header.substring(7);

        try {
            Claims claims = jwtService.extractAllClaims(token);

            String email = claims.getSubject();
            String role = claims.get("role", String.class);

            log.info("JWT SUBJECT PRESENT: {}", email != null);
            log.info("JWT ROLE: {}", role);
            log.info("JWT EXPIRATION: {}", claims.getExpiration());

            boolean valid = email != null
                    && role != null
                    && jwtService.isTokenValid(token, email);

            log.info("JWT VALID: {}", valid);

            if (valid &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                String authority = role.startsWith("ROLE_")
                        ? role
                        : "ROLE_" + role;

                var authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                List.of(new SimpleGrantedAuthority(authority))
                        );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

                log.info("AUTHENTICATION CREATED");
                log.info("GRANTED AUTHORITY: {}", authority);

            } else {
                log.warn("AUTHENTICATION NOT CREATED");
            }

        } catch (JwtException | IllegalArgumentException ex) {
            log.error("JWT VALIDATION FAILED: {}", ex.getClass().getSimpleName());
            SecurityContextHolder.clearContext();
        }

        log.info("SECURITY AUTHENTICATED: {}",
                SecurityContextHolder.getContext().getAuthentication() != null);

        filterChain.doFilter(request, response);

        log.info("RESPONSE STATUS: {}", response.getStatus());
        log.info("========== END JWT DIAGNOSTIC ==========");
    }
}
