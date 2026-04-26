package com.bhaskar.jobportal.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bhaskar.jobportal.model.Application;
import com.bhaskar.jobportal.model.Job;
import com.bhaskar.jobportal.model.User;
import com.bhaskar.jobportal.repository.ApplicationRepository;
import com.bhaskar.jobportal.repository.JobRepository;
import com.bhaskar.jobportal.repository.UserRepository;
import com.bhaskar.jobportal.service.NotificationService;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/my-applications")
    public List<Application> getMyApplications() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return applicationRepository.findByUserId(email);
    }

    @GetMapping("/my-applications-details")
    public List<Map<String, Object>> getUserApplicationsWithJob() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        

        List<Application> applications =
        applicationRepository.findByUserIdOrderByAppliedAtDesc(email);

        return applications.stream().map(app -> {
            Map<String, Object> result = new HashMap<>();

            Job job = null;

            if (app.getJobId() != null) {
                job = jobRepository.findById(app.getJobId()).orElse(null);
            }

            result.put("applicationId", app.getId());
            result.put("status", app.getStatus());
            result.put("appliedAt", app.getAppliedAt());
            result.put("jobId", app.getJobId());
                        result.put("resumeUrl", app.getResumeUrl());

              if (job != null) {
                result.put("title", job.getTitle());
                result.put("company", job.getCompany());
                result.put("location", job.getLocation());
                result.put("jobStatus", job.getStatus());
            } else {
            result.put("title", "Job no longer available");
            result.put("company", "-");
            result.put("location", "-");
            result.put("jobStatus", "DELETED");
   }

            return result;
        }).toList();
    }

    @PostMapping("/apply/{jobId}")
    public ResponseEntity<?> applyToJob(@PathVariable String jobId) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getResumeUrl() == null || user.getResumeUrl().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Please upload your resume in your profile before applying"
            ));
        }

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!"ACTIVE".equals(job.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Job is not active"
            ));
        }

        // Prevent duplicate apply
        boolean alreadyApplied =
                applicationRepository.existsByUserIdAndJobId(email, jobId);

        if (alreadyApplied) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "You already applied for this job"
            ));
        }

        Application application = new Application();
        application.setUserId(email);
        application.setJobId(jobId);
        application.setResumeUrl(user.getResumeUrl());
        application.setStatus(Application.Status.APPLIED);
        application.setAppliedAt(LocalDateTime.now());

        Application savedApplication = applicationRepository.save(application);

        notificationService.notifyUser(
                email,
                "Application submitted",
                "You applied to " + job.getTitle() + " at " + job.getCompany() + ".",
                "APPLICATION_SUBMITTED"
        );

        if (job.getPostedBy() != null && !job.getPostedBy().isBlank()) {
            notificationService.notifyUser(
                    job.getPostedBy(),
                    "New application received",
                    email + " applied to your job: " + job.getTitle() + ".",
                    "NEW_APPLICATION"
            );
        }

        return ResponseEntity.ok(Map.of(
            "message", "Applied successfully",
            "application", savedApplication
        ));
    }
}