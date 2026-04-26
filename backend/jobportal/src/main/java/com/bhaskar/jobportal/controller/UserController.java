package com.bhaskar.jobportal.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.bhaskar.jobportal.dto.LoginRequest;
import com.bhaskar.jobportal.model.User;
import com.bhaskar.jobportal.model.UserProfile;
import com.bhaskar.jobportal.repository.UserRepository;
import com.bhaskar.jobportal.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;


@RestController
@RequestMapping("/users")
public class UserController {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    @Value("${jobportal.recruiter-registration-code:}")
    private String recruiterRegistrationCode;

    @Autowired
    private BCryptPasswordEncoder encoder;
    public UserController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }
    @GetMapping("/test")
    public String test() {
        return "User API is working!";
    }
    @GetMapping
    public List<User> getAllUsers() {
    List<User> users = userRepository.findAll();
    users.forEach(u -> u.setPassword(null)); // hide password
    return users;
   }

    @PostMapping("/register")
public ResponseEntity<String> registerUser(@RequestBody Map<String, String> userData) {
    String name = userData.get("name");
    String email = userData.get("email");
    String password = userData.get("password");
        String requestedRole = userData.getOrDefault("role", "USER");
        String registrationCode = userData.get("registrationCode");

    if (userRepository.findByEmail(email).isPresent()) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
    }

        User.Role role = User.Role.USER;
        if ("RECRUITER".equalsIgnoreCase(requestedRole)) {
            if (recruiterRegistrationCode == null
                    || recruiterRegistrationCode.isBlank()
                    || !recruiterRegistrationCode.equals(registrationCode)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Invalid recruiter registration code");
            }
            role = User.Role.RECRUITER;
        }

    User user = new User();
    user.setName(name);
    user.setEmail(email);
    user.setPassword(encoder.encode(password));
        user.setRole(role);

    userRepository.save(user);
    return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
}

 @PostMapping("/login")
public Object loginUser(@RequestBody LoginRequest request) {

    Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

    if(userOpt.isEmpty()){
        return Map.of("message","Invalid credentials");
    }

    User existingUser = userOpt.get();

    if(!encoder.matches(request.getPassword(), existingUser.getPassword())){
        return Map.of("message","Invalid credentials");
    }

    String token = jwtUtil.generateToken(existingUser.getEmail(), existingUser.getRole().name());

    return Map.of(
        "message", "Login successful",
        "token", token,
        "user", Map.of(
            "id", existingUser.getId(),
            "username", existingUser.getName(),
            "email", existingUser.getEmail(),
            "role", existingUser.getRole().name()
        )
    );
}

@GetMapping("/profile/{email}")
public Object getProfile(@PathVariable String email, HttpServletRequest request) {

    Optional<User> userOpt = userRepository.findByEmail(email);

    if (userOpt.isEmpty()) {
        return Map.of("message", "User not found");
    }

    User user = userOpt.get();
    UserProfile profile = user.getProfile();

    Map<String, Object> response = new HashMap<>();
    response.put("name", user.getName());
    response.put("email", user.getEmail());
    response.put("profilePic", normalizeFileUrl(user.getProfilePic(), request));
    response.put("headline", profile != null ? profile.getHeadline() : null);
    response.put("phone", profile != null ? profile.getPhone() : null);
    response.put("location", profile != null ? profile.getLocation() : null);
    response.put("skills", profile != null ? profile.getSkills() : null);
    response.put("experience", profile != null ? profile.getExperience() : null);
    response.put("education", profile != null ? profile.getEducation() : null);
    response.put("projects", profile != null ? profile.getProjects() : null);
    response.put("about", profile != null ? profile.getAbout() : null);
    response.put("resumeUrl", normalizeFileUrl(user.getResumeUrl(), request));
    response.put("profileCompletion", calculateProfileCompletion(user));

    return response;
}

@PostMapping(value = "/upload-resume", consumes = "multipart/form-data")
public ResponseEntity<?> uploadResume(@RequestParam("resume") MultipartFile file, HttpServletRequest request) {
    try {
        String currentUserEmail = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        Optional<User> userOpt = userRepository.findByEmail(currentUserEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("Resume file is required");
        }

        String contentType = file.getContentType();
        String originalName = file.getOriginalFilename();
        String normalizedOriginalName = originalName == null ? "" : originalName.toLowerCase();
        boolean isPdf = "application/pdf".equalsIgnoreCase(contentType) || normalizedOriginalName.endsWith(".pdf");

        if (!isPdf) {
            return ResponseEntity.badRequest().body("Only PDF resumes are allowed");
        }

        long maxSizeBytes = 2L * 1024 * 1024;
        if (file.getSize() > maxSizeBytes) {
            return ResponseEntity.badRequest().body("Resume size must be 2MB or less");
        }

        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        deleteExistingResumeFile(userOpt.get());

        String fileName = "resume_" + UUID.randomUUID() + ".pdf";
        Path path = Paths.get(uploadDir, fileName);
        Files.write(path, file.getBytes());

        String resumeUrl = buildPublicFileUrl(fileName, request);

        User user = userOpt.get();
        user.setResumeUrl(resumeUrl);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Resume uploaded successfully",
                "resumeUrl", resumeUrl,
                "fileName", fileName
        ));

    } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Resume upload failed");
    }
}

private void deleteExistingResumeFile(User user) {
    if (user == null || user.getResumeUrl() == null || user.getResumeUrl().isBlank()) {
        return;
    }

    try {
        String fileName = user.getResumeUrl().substring(user.getResumeUrl().lastIndexOf('/') + 1);
        Path oldPath = Paths.get(System.getProperty("user.dir"), "uploads", fileName);
        Files.deleteIfExists(oldPath);
    } catch (IOException ignored) {
        // Keep the upload flow resilient if the old file is already gone.
    }
}

@PostMapping("/profile/update")
public Object updateProfile(@RequestBody Map<String, Object> request) {

    String email = (String) request.get("email");

    if (email == null) {
        return Map.of("message", "Email is required");
    }

    Optional<User> userOpt = userRepository.findByEmail(email);

    if (userOpt.isEmpty()) {
        return Map.of("message", "User not found");
    }

    User user = userOpt.get();

    UserProfile profile = new UserProfile();
    profile.setHeadline(asString(request.get("headline")));
    profile.setAbout(asString(request.get("about")));
    profile.setPhone(asString(request.get("phone")));
    profile.setLocation(asString(request.get("location")));
    profile.setExperience(toStringMapList(request.get("experience")));
    profile.setEducation(toStringMapList(request.get("education")));
    profile.setProjects(toStringMapList(request.get("projects")));
    profile.setSkills(toStringList(request.get("skills")));

    String name = (String) request.get("name");
    if (name != null && !name.isBlank()) {
        user.setName(name.trim());
    }

    user.setProfile(profile);

    userRepository.save(user);

    return Map.of("message", "Profile updated successfully");
}

private String asString(Object value) {
    return value == null ? null : String.valueOf(value);
}

private List<Map<String, String>> toStringMapList(Object value) {
    if (!(value instanceof List<?> list)) {
        return null;
    }

    List<Map<String, String>> result = new ArrayList<>();
    for (Object item : list) {
        if (item instanceof Map<?, ?> rawMap) {
            Map<String, String> converted = new HashMap<>();
            rawMap.forEach((key, mapValue) -> {
                if (key != null && mapValue != null) {
                    converted.put(String.valueOf(key), String.valueOf(mapValue));
                }
            });
            result.add(converted);
        }
    }

    return result;
}

private List<String> toStringList(Object value) {
    if (!(value instanceof List<?> list)) {
        return null;
    }

    return list.stream()
            .filter(Objects::nonNull)
            .map(String::valueOf)
            .toList();
}

@GetMapping("/debug")
public String debug() {
    return "Controller is working";
}

@ExceptionHandler(Exception.class)
public ResponseEntity<Map<String, String>> handleException(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                         .body(Map.of("message", "An unexpected error occurred", "error", ex.getMessage()));
}

@PostMapping("/upload-profile-pic")
public ResponseEntity<?> uploadProfilePic(
        @RequestParam("profilePic") MultipartFile file,
    @RequestParam("email") String email,
    HttpServletRequest request
) {
    try {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();

        // ✅ DELETE OLD IMAGE
        if (user.getProfilePic() != null) {
            String oldImagePath = extractUploadFileName(user.getProfilePic());

            String fullPath = System.getProperty("user.dir") + "/uploads/" + oldImagePath;

            File oldFile = new File(fullPath);
            if (oldFile.exists()) {
                oldFile.delete();
                System.out.println("Old image deleted: " + fullPath);
            }
        }

        // ✅ SAVE NEW IMAGE
        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir, fileName);

        Files.write(path, file.getBytes());

        String imageUrl = buildPublicFileUrl(fileName, request);

        user.setProfilePic(imageUrl);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));

    } catch (IOException e) {
        return ResponseEntity.status(500).body("Upload failed");
    }
}

private int calculateProfileCompletion(User user) {
        UserProfile profile = user.getProfile();

        int completedFields = 0;

        if (user.getName() != null && !user.getName().isBlank()) completedFields++;
        if (profile != null && profile.getHeadline() != null && !profile.getHeadline().isBlank()) completedFields++;
        if (profile != null && profile.getAbout() != null && !profile.getAbout().isBlank()) completedFields++;
        if (profile != null && profile.getSkills() != null && !profile.getSkills().isEmpty()) completedFields++;
        if (profile != null && profile.getExperience() != null && !profile.getExperience().isEmpty()) completedFields++;
        if (profile != null && profile.getEducation() != null && !profile.getEducation().isEmpty()) completedFields++;
        if (profile != null && profile.getProjects() != null && !profile.getProjects().isEmpty()) completedFields++;
        if (user.getProfilePic() != null && !user.getProfilePic().isBlank()) completedFields++;
        if (user.getResumeUrl() != null && !user.getResumeUrl().isBlank()) completedFields++;

        return Math.round((completedFields * 100f) / 9f);
    }

private String buildPublicFileUrl(String fileName, HttpServletRequest request) {
    return ServletUriComponentsBuilder.fromRequestUri(request)
            .replacePath("/uploads/" + fileName)
            .replaceQuery(null)
            .build()
            .toUriString();
}

private String normalizeFileUrl(String storedUrl, HttpServletRequest request) {
    if (storedUrl == null || storedUrl.isBlank()) {
        return storedUrl;
    }

    if (storedUrl.contains("/uploads/")) {
        String fileName = extractUploadFileName(storedUrl);
        if (fileName != null && !fileName.isBlank()) {
            return buildPublicFileUrl(fileName, request);
        }
    }

    return storedUrl;
}

private String extractUploadFileName(String url) {
    if (url == null || url.isBlank()) {
        return "";
    }

    int lastSlash = url.lastIndexOf('/');
    return lastSlash >= 0 ? url.substring(lastSlash + 1) : url;
}
}


