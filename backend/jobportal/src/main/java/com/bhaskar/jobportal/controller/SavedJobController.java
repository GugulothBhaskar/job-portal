package com.bhaskar.jobportal.controller;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bhaskar.jobportal.model.User;
import com.bhaskar.jobportal.repository.UserRepository;

@RestController
@RequestMapping("/api/saved-jobs")
public class SavedJobController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getSavedJobs() {
        User user = getCurrentUser();

        List<String> savedJobs = user.getSavedJobs() == null ? List.of() : user.getSavedJobs();
        return ResponseEntity.ok(Map.of(
                "savedJobs", savedJobs,
                "count", savedJobs.size()
        ));
    }

    @PostMapping("/{jobId}")
    public ResponseEntity<?> saveJob(@PathVariable String jobId) {
        User user = getCurrentUser();

        Set<String> unique = new LinkedHashSet<>(
                user.getSavedJobs() == null ? List.of() : user.getSavedJobs()
        );
        unique.add(jobId);

        user.setSavedJobs(List.copyOf(unique));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Job saved",
                "savedJobs", user.getSavedJobs(),
                "count", user.getSavedJobs().size()
        ));
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<?> unsaveJob(@PathVariable String jobId) {
        User user = getCurrentUser();

        Set<String> unique = new LinkedHashSet<>(
                user.getSavedJobs() == null ? List.of() : user.getSavedJobs()
        );
        unique.remove(jobId);

        user.setSavedJobs(List.copyOf(unique));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Job unsaved",
                "savedJobs", user.getSavedJobs(),
                "count", user.getSavedJobs().size()
        ));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
