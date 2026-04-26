package com.bhaskar.jobportal.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bhaskar.jobportal.model.Job;
import com.bhaskar.jobportal.model.User;
import com.bhaskar.jobportal.model.UserProfile;
import com.bhaskar.jobportal.repository.ApplicationRepository;
import com.bhaskar.jobportal.repository.JobRepository;
import com.bhaskar.jobportal.repository.UserRepository;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
public Map<String, Object> getDashboard() {

    String email = SecurityContextHolder.getContext().getAuthentication().getName();
    

    String role = SecurityContextHolder.getContext()
            .getAuthentication()
            .getAuthorities()
            .iterator()
            .next()
            .getAuthority()
            .replace("ROLE_", "");

    Map<String, Object> data = new HashMap<>();
    data.put("role", role);

    if (role.equals("USER")) {

        User user = userRepository.findByEmail(email).orElse(null);
        int savedJobs = (user != null && user.getSavedJobs() != null) ? user.getSavedJobs().size() : 0;
        int profileCompletion = user != null ? calculateProfileCompletion(user) : 0;

        data.put("appliedJobs", applicationRepository.countByUserId(email));
        data.put("savedJobs", savedJobs);
        data.put("availableJobs", jobRepository.countByStatus("ACTIVE"));
        data.put("profileCompletion", profileCompletion);
    } 
    else if (role.equals("RECRUITER")) {

        User user = userRepository.findByEmail(email).orElse(null);
        int profileCompletion = user != null ? calculateProfileCompletion(user) : 0;

        // 1. get recruiter jobs
        List<Job> jobs = jobRepository.findByPostedBy(email);

        // 2. extract jobIds
        List<String> jobIds = jobs.stream().map(Job::getId).toList();

        // 3. safe counts
        long applications = jobIds.isEmpty() ? 0 :
                applicationRepository.countByJobIdIn(jobIds);

        long candidates = 0;
        if (!jobIds.isEmpty()) {
            Set<String> uniqueApplicants = applicationRepository.findByJobIdIn(jobIds)
                .stream()
                .map(app -> app.getUserId())
                .filter(userId -> userId != null && !userId.isBlank())
                .collect(java.util.stream.Collectors.toSet());
            candidates = uniqueApplicants.size();
        }

        // 4. response
        data.put("myJobs", jobs.size());
        data.put("applications", applications);
        data.put("candidates", candidates);
        data.put("jobs", jobRepository.countByStatus("ACTIVE"));
        data.put("profileCompletion", profileCompletion);
    }

    return data;
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
}