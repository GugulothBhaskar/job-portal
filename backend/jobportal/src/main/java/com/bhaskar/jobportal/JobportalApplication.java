package com.bhaskar.jobportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication(scanBasePackages = "com.bhaskar.jobportal")
public class JobportalApplication {

	public static void main(String[] args) {
		SpringApplication.run(JobportalApplication.class, args);
	}

	@RestController
	public static class TestController {
		@GetMapping({"/", "/health", "/test"})
		public String testConnection() {
			return "Backend is connected!";
		}
}
}
