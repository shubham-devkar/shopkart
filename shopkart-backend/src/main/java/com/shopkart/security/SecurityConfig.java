
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

                        .requestMatchers(
                                "/api/auth/**",
                                "/profile-photos/**",
                                "/error"
                        ).permitAll()

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET, "/api/reviews/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST, "/api/reviews/**"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.DELETE, "/api/reviews/**"
                        ).hasRole("ADMIN")

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

                        .requestMatchers(org.springframework.http.HttpMethod.POST,
                                "/api/coupons/apply").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST,
                                "/api/coupons").hasRole("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.GET,
                                "/api/coupons").hasRole("ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.PATCH,
                                "/api/coupons/**").hasRole("ADMIN")

                        .requestMatchers("/api/admin/analytics/**").hasRole("ADMIN")


// Admin can view all customer orders
                                .requestMatchers(
                                        HttpMethod.GET, "/api/orders/admin/all"
                                ).hasRole("ADMIN")

// Only Admin can update order status
                                .requestMatchers(
                                        HttpMethod.PATCH, "/api/orders/*/status"
                                ).hasRole("ADMIN")

// Logged-in customers can view their own orders
                                .requestMatchers(
                                        HttpMethod.GET, "/api/orders"
                                ).authenticated()

// Logged-in customers can place orders
                                .requestMatchers(
                                        HttpMethod.POST, "/api/orders"
                                ).authenticated()

// Customers can view order tracking
                                .requestMatchers(
                                        HttpMethod.GET, "/api/orders/*/tracking"
                                ).authenticated()


                                        .requestMatchers("/api/health").permitAll()
                                       
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

        config.setAllowedOrigins(
                List.of("http://localhost:4200")
        );

        config.setAllowedMethods(
                List.of(
                        "GET", "POST", "PUT", "PATCH",
                        "DELETE", "OPTIONS"
                )
        );

        config.setAllowedHeaders(
                List.of("Authorization", "Content-Type")
        );

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
