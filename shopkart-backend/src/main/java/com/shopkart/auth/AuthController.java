package com.shopkart.auth;

import com.shopkart.security.JwtService;

import jakarta.mail.internet.MimeMessage;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

 private final UserRepository users;
 private final PendingEmailRegistrationRepository pendingRepository;
 private final JwtService jwtService;
 private final JavaMailSender mailSender;

 private final BCryptPasswordEncoder encoder =
         new BCryptPasswordEncoder();

 private final SecureRandom secureRandom = new SecureRandom();

 @Value("${spring.mail.username}")
 private String mailUsername;

 public AuthController(
         UserRepository users,
         PendingEmailRegistrationRepository pendingRepository,
         JwtService jwtService,
         JavaMailSender mailSender) {

  this.users = users;
  this.pendingRepository = pendingRepository;
  this.jwtService = jwtService;
  this.mailSender = mailSender;
 }

 public record SendOtpRequest(
         @NotBlank @Size(max = 100) String name,
         @NotBlank @Email @Size(max = 160) String email,
         @NotBlank @Size(min = 6, max = 72) String password
 ) {}

 public record VerifyOtpRequest(
         @NotBlank @Email String email,
         @NotBlank @Size(min = 6, max = 6) String otp
 ) {}

 public record ResendOtpRequest(
         @NotBlank @Email String email
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

 // STEP 1: Send OTP
 @PostMapping("/register/send-otp")
 @Transactional
 public ResponseEntity<?> sendRegistrationOtp(
         @Valid @RequestBody SendOtpRequest request) {

  String email = normalizeEmail(request.email());

  if (users.existsByEmailIgnoreCase(email)) {
   return ResponseEntity.status(HttpStatus.CONFLICT)
           .body(Map.of(
                   "message",
                   "This email is already registered."
           ));
  }

  LocalDateTime now = LocalDateTime.now();

  PendingEmailRegistration pending =
          pendingRepository.findByEmailIgnoreCase(email)
                  .orElseGet(PendingEmailRegistration::new);

  boolean existingPending = pending.getId() != null;

  if (existingPending && !canResend(pending, now)) {
   return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
           .body(Map.of(
                   "message",
                   "Please wait 60 seconds before requesting another OTP. Maximum 3 resends allowed."
           ));
  }

  pending.setName(request.name().trim());
  pending.setEmail(email);

  // Password is hashed before saving.
  pending.setPasswordHash(encoder.encode(request.password()));

  if (existingPending) {
   pending.setResendCount(pending.getResendCount() + 1);
  } else {
   pending.setResendCount(0);
  }

  pending.setAttempts(0);

  String otp = generateOtp();

  // OTP is stored as a BCrypt hash, never as plain text.
  pending.setOtpHash(encoder.encode(otp));
  pending.setExpiresAt(now.plusMinutes(5));
  pending.setLastSentAt(now);

  pendingRepository.save(pending);

  sendOtpEmail(email, request.name().trim(), otp);

  return ResponseEntity.ok(Map.of(
          "message",
          "OTP sent successfully to your email. It is valid for 5 minutes."
  ));
 }

 // STEP 2: Verify OTP and create account
 @PostMapping("/register/verify-otp")
 @Transactional
 public ResponseEntity<?> verifyRegistrationOtp(
         @Valid @RequestBody VerifyOtpRequest request) {

  String email = normalizeEmail(request.email());

  PendingEmailRegistration pending =
          pendingRepository.findByEmailIgnoreCase(email)
                  .orElse(null);

  if (pending == null) {
   return ResponseEntity.status(HttpStatus.BAD_REQUEST)
           .body(Map.of(
                   "message",
                   "No pending registration found. Please request a new OTP."
           ));
  }

  if (users.existsByEmailIgnoreCase(email)) {
   pendingRepository.delete(pending);

   return ResponseEntity.status(HttpStatus.CONFLICT)
           .body(Map.of(
                   "message",
                   "This email is already registered."
           ));
  }

  if (LocalDateTime.now().isAfter(pending.getExpiresAt())) {
   pendingRepository.delete(pending);

   return ResponseEntity.status(HttpStatus.BAD_REQUEST)
           .body(Map.of(
                   "message",
                   "OTP expired. Please request a new OTP."
           ));
  }

  if (pending.getAttempts() >= 5) {
   pendingRepository.delete(pending);

   return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
           .body(Map.of(
                   "message",
                   "Maximum OTP attempts exceeded. Please register again."
           ));
  }

  if (!encoder.matches(request.otp(), pending.getOtpHash())) {

   pending.setAttempts(pending.getAttempts() + 1);
   pendingRepository.save(pending);

   return ResponseEntity.status(HttpStatus.BAD_REQUEST)
           .body(Map.of(
                   "message",
                   "Invalid OTP. Please check and try again."
           ));
  }

  // OTP is correct. Only now create the actual user.
  AppUser user = new AppUser();

  user.setName(pending.getName());
  user.setEmail(pending.getEmail());
  user.setPasswordHash(pending.getPasswordHash());

  // Public registration can only create USER accounts.
  user.setRole("USER");

  AppUser savedUser = users.save(user);

  pendingRepository.delete(pending);

  return ResponseEntity.status(HttpStatus.CREATED)
          .body(response(
                  savedUser,
                  "Email verified. Account created successfully."
          ));
 }

 // STEP 3: Resend OTP
 @PostMapping("/register/resend-otp")
 @Transactional
 public ResponseEntity<?> resendRegistrationOtp(
         @Valid @RequestBody ResendOtpRequest request) {

  String email = normalizeEmail(request.email());

  PendingEmailRegistration pending =
          pendingRepository.findByEmailIgnoreCase(email)
                  .orElse(null);

  if (pending == null) {
   return ResponseEntity.status(HttpStatus.BAD_REQUEST)
           .body(Map.of(
                   "message",
                   "No pending registration found. Please register again."
           ));
  }

  if (users.existsByEmailIgnoreCase(email)) {
   pendingRepository.delete(pending);

   return ResponseEntity.status(HttpStatus.CONFLICT)
           .body(Map.of(
                   "message",
                   "This email is already registered."
           ));
  }

  LocalDateTime now = LocalDateTime.now();

  if (!canResend(pending, now)) {
   return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
           .body(Map.of(
                   "message",
                   "Please wait 60 seconds before requesting another OTP. Maximum 3 resends allowed."
           ));
  }

  String otp = generateOtp();

  pending.setOtpHash(encoder.encode(otp));
  pending.setExpiresAt(now.plusMinutes(5));
  pending.setLastSentAt(now);
  pending.setAttempts(0);
  pending.setResendCount(pending.getResendCount() + 1);

  pendingRepository.save(pending);

  sendOtpEmail(email, pending.getName(), otp);

  return ResponseEntity.ok(Map.of(
          "message",
          "A new OTP has been sent to your email."
  ));
 }

 // Existing LOGIN API - kept compatible
 @PostMapping("/login")
 public ResponseEntity<?> login(
         @Valid @RequestBody LoginRequest request) {

  String email = normalizeEmail(request.email());

  AppUser user = users.findByEmailIgnoreCase(email)
          .orElse(null);

  if (user == null ||
          !encoder.matches(
                  request.password(),
                  user.getPasswordHash()
          )) {

   return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
           .body(Map.of(
                   "message",
                   "Invalid email or password."
           ));
  }

  return ResponseEntity.ok(
          response(user, "Login successful.")
  );
 }

 private boolean canResend(
         PendingEmailRegistration pending,
         LocalDateTime now) {

  if (pending.getLastSentAt() == null) {
   return true;
  }

  if (pending.getResendCount() >= 3) {
   return false;
  }

  return !now.isBefore(
          pending.getLastSentAt().plusSeconds(60)
  );
 }

 private String generateOtp() {
  int number = secureRandom.nextInt(1_000_000);
  return String.format("%06d", number);
 }

 private String normalizeEmail(String email) {
  return email.trim().toLowerCase(Locale.ROOT);
 }

 private void sendOtpEmail(
         String email,
         String name,
         String otp) {

  try {
   MimeMessage message = mailSender.createMimeMessage();

   MimeMessageHelper helper =
           new MimeMessageHelper(message, true, "UTF-8");

   helper.setFrom(mailUsername);
   helper.setTo(email);
   helper.setSubject("ShopKart - Email Verification OTP");

   String html = """
                    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
                        <h2 style="color:#2874f0">Welcome to ShopKart!</h2>
                        <p>Hello %s,</p>
                        <p>Use the following OTP to verify your email address and complete your registration.</p>
                        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2874f0;padding:18px;text-align:center;background:#f4f7ff;border-radius:8px">
                            %s
                        </div>
                        <p>This OTP is valid for <b>5 minutes</b>.</p>
                        <p>Do not share this OTP with anyone.</p>
                        <p style="color:#777">Thank you,<br>ShopKart Team</p>
                    </div>
                    """.formatted(escapeHtml(name), otp);

   helper.setText(html, true);

   mailSender.send(message);

  } catch (Exception exception) {
   throw new RuntimeException(
           "Unable to send verification email. Please check Gmail SMTP configuration.",
           exception
   );
  }
 }

 private String escapeHtml(String value) {
  return value
          .replace("&", "&amp;")
          .replace("<", "&lt;")
          .replace(">", "&gt;")
          .replace("\"", "&quot;")
          .replace("'", "&#39;");
 }

 private AuthResponse response(AppUser user, String message) {

  String token = jwtService.generateToken(
          user.getEmail(),
          user.getRole()
  );

  return new AuthResponse(
          token,
          user.getId(),
          user.getName(),
          user.getEmail(),
          user.getRole(),
          message
  );
 }
}