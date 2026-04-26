package com.bhaskar.jobportal.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bhaskar.jobportal.model.Application;
import com.bhaskar.jobportal.model.Job;
import com.bhaskar.jobportal.model.User;
import com.bhaskar.jobportal.model.UserProfile;
import com.bhaskar.jobportal.repository.ApplicationRepository;
import com.bhaskar.jobportal.repository.JobRepository;
import com.bhaskar.jobportal.repository.UserRepository;
import com.bhaskar.jobportal.service.NotificationService;

@RestController
@RequestMapping("/api/recruiter")
@CrossOrigin(origins = "http://localhost:5173")
public class RecruiterController {

    private final JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public RecruiterController(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    // POST JOB
    @PostMapping("/jobs")
    public ResponseEntity<Job> postJob(@RequestBody Job job) {

        String recruiterEmail =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        job.setPostedBy(recruiterEmail);
        job.setCreatedAt(LocalDateTime.now());
        job.setStatus("ACTIVE");

        return ResponseEntity.ok(jobRepository.save(job));
    }

    // GET MY JOBS
    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getMyJobs() {

        String recruiterEmail =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        List<Job> jobs = jobRepository.findByPostedBy(recruiterEmail);

        return ResponseEntity.ok(jobs);
    }

    // DELETE JOB
    @DeleteMapping("/jobs/{id}")
public ResponseEntity<String> deleteJob(@PathVariable String id) {

    jobRepository.deleteById(id);

    return ResponseEntity.ok("Job deleted successfully");
}

    // PUT JOB
    @PutMapping("/jobs/{id}")
    public ResponseEntity<?> updateJob(
            @PathVariable String id,
            @RequestBody Job updatedJob
    ) {
        Optional<Job> jobOpt = jobRepository.findById(id);

        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Job not found");
        }

        Job job = jobOpt.get();

        // Update fields
        job.setTitle(updatedJob.getTitle());
        job.setCompany(updatedJob.getCompany());
        job.setLocation(updatedJob.getLocation());
        job.setSalary(updatedJob.getSalary());
        job.setExperience(updatedJob.getExperience());
        job.setSkills(updatedJob.getSkills());
        job.setStatus(updatedJob.getStatus());
        job.setDescription(updatedJob.getDescription());

        jobRepository.save(job);

        return ResponseEntity.ok(job);
    }

    // GET APPLICATIONS FOR A JOB
    @GetMapping("/jobs/{jobId}/applications")
    public ResponseEntity<?> getApplications(@PathVariable String jobId) {

        List<Application> applications = applicationRepository.findByJobId(jobId);

        List<Map<String, Object>> response = applications.stream().map(app -> {
            Map<String, Object> map = new HashMap<>();

            User user = userRepository.findByEmail(app.getUserId()).orElse(null);

            map.put("applicationId", app.getId());
            map.put("status", app.getStatus());
            map.put("appliedAt", app.getAppliedAt());
            map.put("resumeUrl", app.getResumeUrl());

            if (user != null) {
                map.put("name", user.getName());
                map.put("email", user.getEmail());

                UserProfile profile = user.getProfile();
                if (profile != null) {
                    map.put("skills", profile.getSkills());
                }

                if (map.get("resumeUrl") == null) {
                    map.put("resumeUrl", user.getResumeUrl());
                }
            }

            return map;
        }).toList();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request
    ) {
        String recruiterEmail = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        Job job = jobRepository.findById(app.getJobId())
            .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getPostedBy().equals(recruiterEmail)) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        String status = request.get("status");

        Application.Status current = app.getStatus();
        Application.Status newStatus;

        try {
            newStatus = Application.Status.valueOf(status.toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid status value"
            ));
        }

        if (current == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Current application status is invalid"
            ));
        }

        boolean valid = switch (current) {
            case APPLIED -> newStatus == Application.Status.REVIEWED
                || newStatus == Application.Status.REJECTED;

            case REVIEWED -> newStatus == Application.Status.SELECTED
                || newStatus == Application.Status.REJECTED;

            case SELECTED -> newStatus == Application.Status.REJECTED
                || newStatus == Application.Status.REVIEWED;

            case REJECTED -> newStatus == Application.Status.REVIEWED;
        };

        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid status transition"
            ));
        }

        app.setStatus(newStatus);

        applicationRepository.save(app);

        notificationService.notifyUser(
            app.getUserId(),
            "Application status updated",
            "Your application for " + job.getTitle() + " moved from " + current + " to " + newStatus + ".",
            "APPLICATION_STATUS_UPDATED"
        );

        notificationService.notifyUser(
            recruiterEmail,
            "Candidate status changed",
            "You marked " + app.getUserId() + " as " + newStatus + " for " + job.getTitle() + ".",
            "RECRUITER_ACTION"
        );

        return ResponseEntity.ok(Map.of(
                "message", "Status updated",
            "status", app.getStatus(),
            "previousStatus", current
        ));
    }
}