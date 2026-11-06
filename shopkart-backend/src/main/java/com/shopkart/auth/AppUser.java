
package com.shopkart.auth;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class AppUser {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @Column(nullable = false, length = 100)
 private String name;

 @Column(nullable = false, unique = true, length = 160)
 private String email;

 @Column(nullable = false, length = 100)
 private String passwordHash;

 @Column(nullable = false, length = 20)
 private String role = "USER";

 private LocalDateTime createdAt = LocalDateTime.now();

 @Column(length = 500)
 private String profilePhotoUrl;

 public Long getId() {
  return id;
 }

 public String getName() {
  return name;
 }

 public void setName(String name) {
  this.name = name;
 }

 public String getEmail() {
  return email;
 }

 public void setEmail(String email) {
  this.email = email;
 }

 public String getPasswordHash() {
  return passwordHash;
 }

 public void setPasswordHash(String passwordHash) {
  this.passwordHash = passwordHash;
 }

 public String getRole() {
  return role;
 }

 public void setRole(String role) {
  this.role = role;
 }

 public LocalDateTime getCreatedAt() {
  return createdAt;
 }

 public String getProfilePhotoUrl() {
  return profilePhotoUrl;
 }

 public void setProfilePhotoUrl(String profilePhotoUrl) {
  this.profilePhotoUrl = profilePhotoUrl;
 }
}
