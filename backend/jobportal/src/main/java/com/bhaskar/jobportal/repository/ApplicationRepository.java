package com.bhaskar.jobportal.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.bhaskar.jobportal.model.Application;

public interface ApplicationRepository extends MongoRepository<Application, String> {
    boolean existsByUserIdAndJobId(String userId, String jobId);
    List<Application> findByUserId(String userId);
    List<Application> findByUserIdOrderByAppliedAtDesc(String userId);
    List<Application> findByJobId(String jobId);
    List<Application> findByJobIdIn(List<String> jobIds);
    long countByUserId(String userId);
    long countByJobIdIn(List<String> jobIds);
    long countDistinctUserIdByJobIdIn(List<String> jobIds);
}
