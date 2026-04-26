package com.bhaskar.jobportal.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthFilter jwtAuthFilter) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .authorizeHttpRequests(auth -> auth

.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

.requestMatchers("/users/register", "/users/login").permitAll()
.requestMatchers(HttpMethod.POST, "/users/upload-resume").hasRole("USER")

.requestMatchers("/logos/**", "/uploads/**").permitAll()

.requestMatchers("/api/jobs", "/api/jobs/**").permitAll()

.requestMatchers("/api/recruiter/**").hasRole("RECRUITER")

.requestMatchers(HttpMethod.POST, "/api/jobs/**").hasRole("RECRUITER")
.requestMatchers(HttpMethod.PUT, "/api/jobs/**").hasRole("RECRUITER")
.requestMatchers(HttpMethod.DELETE, "/api/jobs/**").hasRole("RECRUITER")

.requestMatchers("/api/applications/my-applications", "/api/applications/my-applications-details").hasRole("USER")
.requestMatchers("/api/applications/apply/**").hasRole("USER")
.requestMatchers("/api/saved-jobs/**").hasRole("USER")

.requestMatchers("/api/applications/manage/**").hasRole("RECRUITER")

.requestMatchers("/api/dashboard/**").hasAnyRole("USER","RECRUITER")

.requestMatchers("/users/profile/**").hasAnyRole("USER","RECRUITER")

.anyRequest().authenticated()
);

        http.addFilterBefore(jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();
        

        config.setAllowedOrigins(List.of(
        "http://localhost:5173",      // local dev
        "http://127.0.0.1:5173"    // local dev alt
        // "https://yourdomain.com",     // production frontend
        // "https://www.yourdomain.com"  // optional www
    ));
        config.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(List.of("Authorization"));
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}