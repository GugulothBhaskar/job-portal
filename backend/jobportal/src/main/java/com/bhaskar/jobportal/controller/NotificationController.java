package com.bhaskar.jobportal.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bhaskar.jobportal.model.Notification;
import com.bhaskar.jobportal.repository.NotificationRepository;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository repo;

    @PostMapping
    public Notification create(@RequestBody Notification n) {
        if (n.getCreatedAt() == null) {
            n.setCreatedAt(LocalDateTime.now());
        }
        return repo.save(n);
    }

    @GetMapping
    public List<Notification> getAll(@RequestParam(required = false) String userId) {
        String currentUser = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

        if (userId != null && !userId.isBlank() && !userId.equals(currentUser)) {
            return List.of();
        }

        userId = currentUser;

        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PutMapping("/{id}/read")
    public Map<String, Object> markRead(@PathVariable String id) {
        String currentUser = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

        Notification n = repo.findById(id).orElseThrow();
        if (!currentUser.equals(n.getUserId())) {
            throw new RuntimeException("Not authorized to update this notification");
        }

        n.setRead(true);
        n.setReadAt(LocalDateTime.now());
        repo.save(n);

        long unread = repo.countByUserIdAndReadFalse(currentUser);
        return Map.of("message", "Notification marked as read", "unreadCount", unread);
    }

    @PutMapping("/read-all")
    public Map<String, Object> markAllRead() {
        String currentUser = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

        List<Notification> notifications = repo.findByUserId(currentUser);
        LocalDateTime now = LocalDateTime.now();

        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
                notification.setReadAt(now);
            }
        }

        repo.saveAll(notifications);
        return Map.of("message", "All notifications marked as read", "unreadCount", 0);
    }
}
