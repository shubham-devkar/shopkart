
package com.shopkart.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(Customizer.withDefaults())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers(
                                "/",
                                "/favicon.ico",
                                "/api/health",
                                "/api/auth/**",
                                "/profile-photos/**",
                                "/error",
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // Reviews
                        .requestMatchers(
                                HttpMethod.GET, "/api/reviews/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST, "/api/reviews/**"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.DELETE, "/api/reviews/**"
                        ).hasRole("ADMIN")

                        // Products
                        .requestMatchers(
                                HttpMethod.GET, "/api/products/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST, "/api/products/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT, "/api/products/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PATCH, "/api/products/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE, "/api/products/**"
                        ).hasRole("ADMIN")

                        // Coupons
                        .requestMatchers(
                                HttpMethod.POST, "/api/coupons/apply"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.POST, "/api/coupons"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.GET, "/api/coupons"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PATCH, "/api/coupons/**"
                        ).hasRole("ADMIN")

                        // Admin analytics
                        .requestMatchers(
                                "/api/admin/analytics/**"
                        ).hasRole("ADMIN")

                        // Orders
                        .requestMatchers(
                                HttpMethod.GET, "/api/orders/admin/all"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PATCH, "/api/orders/*/status"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.GET, "/api/orders"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.POST, "/api/orders"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.GET, "/api/orders/*/tracking"
                        ).authenticated()

                        // All remaining endpoints require authentication
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Allowed frontend origins
        config.setAllowedOriginPatterns(
                List.of(
                        "http://localhost:4200",
                        "https://shopkart-0.onrender.com",
                        "https://shopkart-5-5d5r.onrender.com"
                )
        );

        // Allowed HTTP methods
        config.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        // Allowed request headers
        config.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"
                )
        );

        // Allow credentials
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
