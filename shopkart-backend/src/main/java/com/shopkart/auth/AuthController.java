
package com.shopkart.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Map;

import com.shopkart.security.JwtService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

 private final UserRepository users;
 private final JwtService jwtService;
 private final BCryptPasswordEncoder encoder =
         new BCryptPasswordEncoder();

 public AuthController(UserRepository users,
                       JwtService jwtService) {
  this.users = users;
  this.jwtService = jwtService;
 }

 public record RegisterRequest(
         @NotBlank @Size(max = 100) String name,
         @NotBlank @Email String email,
         @NotBlank @Size(min = 6, max = 72) String password
 ) {}

 public record LoginRequest(
         @NotBlank @Email String email,
         @NotBlank String password
 ) {}

 public record AuthResponse(
         String token,
         Long id,
         String name,
         String email,
         String role,
         String message
 ) {}

 @PostMapping("/register")
 public ResponseEntity<?> register(
         @Valid @RequestBody RegisterRequest r) {

  String email = r.email().trim().toLowerCase(Locale.ROOT);

  if (users.existsByEmailIgnoreCase(email)) {
   return ResponseEntity.status(HttpStatus.CONFLICT)
           .body(Map.of(
                   "message",
                   "This email is already registered."
           ));
  }

  AppUser u = new AppUser();
  u.setName(r.name().trim());
  u.setEmail(email);
  u.setPasswordHash(encoder.encode(r.password()));

  // Public registration must never grant ADMIN.
  u.setRole("USER");
  users.save(u);

  return ResponseEntity.status(HttpStatus.CREATED)
          .body(response(u, "Account created successfully."));
 }

 @PostMapping("/login")
 public ResponseEntity<?> login(
         @Valid @RequestBody LoginRequest r) {

  String email = r.email().trim().toLowerCase(Locale.ROOT);

  AppUser u = users.findByEmailIgnoreCase(email)
          .orElse(null);

  if (u == null ||
          !encoder.matches(r.password(), u.getPasswordHash())) {
   return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
           .body(Map.of(
                   "message",
                   "Invalid email or password."
           ));
  }

  return ResponseEntity.ok(
          response(u, "Login successful.")
  );
 }

 private AuthResponse response(AppUser u, String msg) {
  String token = jwtService.generateToken(
          u.getEmail(),
          u.getRole()
  );

  return new AuthResponse(
          token,
          u.getId(),
          u.getName(),
          u.getEmail(),
          u.getRole(),
          msg
  );
 }
}
