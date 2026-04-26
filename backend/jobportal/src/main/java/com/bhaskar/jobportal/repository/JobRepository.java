package com.bhaskar.jobportal.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.bhaskar.jobportal.model.Job;

public interface JobRepository extends MongoRepository<Job, String> {

    List<Job> findByPostedBy(String postedBy);
    List<Job> findByStatus(String status);

    long count(); // total jobs
    long countByPostedBy(String postedBy); // recruiter jobs
    long countByStatus(String status); // active jobs

}