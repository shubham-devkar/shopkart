
package com.shopkart.auth;

import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:4200")
public class ProfileController {

    private final AppUserRepository userRepository;

    public ProfileController(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public Map<String, Object> getProfile(@RequestParam String email) {
        AppUser user = findUser(email);
        return profileResponse(user);
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> uploadPhoto(
            @RequestParam String email,
            @RequestParam("photo") MultipartFile photo) throws IOException {

        AppUser user = findUser(email);

        if (photo.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select a photo");
        }

        String contentType = photo.getContentType();
        if (contentType == null ||
                !(contentType.equals("image/jpeg")
                        || contentType.equals("image/png")
                        || contentType.equals("image/webp"))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Only JPG, PNG and WEBP images are allowed");
        }

        if (photo.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Photo must be smaller than 5 MB");
        }

        String originalName = photo.getOriginalFilename();
        String extension = ".jpg";

        if (originalName != null) {
            String lower = originalName.toLowerCase();
            if (lower.endsWith(".png")) extension = ".png";
            else if (lower.endsWith(".webp")) extension = ".webp";
        }

        String fileName = UUID.randomUUID() + extension;

        Path uploadDirectory = Paths.get("uploads", "profile-photos")
                .toAbsolutePath().normalize();

        Files.createDirectories(uploadDirectory);

        Path destination = uploadDirectory.resolve(fileName).normalize();

        if (!destination.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid file name");
        }

        Files.copy(photo.getInputStream(), destination,
                StandardCopyOption.REPLACE_EXISTING);

        user.setProfilePhotoUrl("/profile-photos/" + fileName);
        userRepository.save(user);

        return profileResponse(user);
    }

    private AppUser findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
    }

    private Map<String, Object> profileResponse(AppUser user) {
        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "profilePhotoUrl", user.getProfilePhotoUrl() == null
                        ? "" : user.getProfilePhotoUrl()
        );
    }
}
