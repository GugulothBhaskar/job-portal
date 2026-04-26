package com.bhaskar.jobportal.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bhaskar.jobportal.model.Application;
import com.bhaskar.jobportal.model.Job;
import com.bhaskar.jobportal.repository.ApplicationRepository;
import com.bhaskar.jobportal.repository.JobRepository;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public JobController(JobRepository jobRepository, ApplicationRepository applicationRepository) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
    }

    // ✅ Get all jobs
    @GetMapping
public List<Job> getAllJobs() {
    return jobRepository.findByStatus("ACTIVE");
}

    // ✅ Get job by ID
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable String id) {
        Optional<Job> job = jobRepository.findById(id);
        return job.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // ✅ Apply for job
    @PostMapping("/applications")
    public ResponseEntity<String> applyForJob(@RequestBody Application application) {
        if (applicationRepository.existsByUserIdAndJobId(application.getUserId(), application.getJobId())) {
            return ResponseEntity.badRequest().body("Duplicate application not allowed.");
        }
        applicationRepository.save(application);
        return ResponseEntity.ok("Application submitted successfully.");
    }

    
    
}