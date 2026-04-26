package com.bhaskar.jobportal.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.bhaskar.jobportal.model.User;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}