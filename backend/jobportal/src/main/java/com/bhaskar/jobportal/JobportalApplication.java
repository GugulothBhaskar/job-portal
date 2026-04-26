package com.bhaskar.jobportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication(scanBasePackages = "com.bhaskar.jobportal")
public class JobportalApplication {

	public static void main(String[] args) {
		// Temporary entry point for the application
		SpringApplication.run(JobportalApplication.class, args);
	}
	@RestController
	@CrossOrigin(origins = "http://localhost:5173")
    public class TestController {
    @GetMapping("/test")
    public String testConnection() {
        return "Backend is connected!";
    }
}
}
