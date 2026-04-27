package com.bhaskar.jobportal.controller;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UploadController {

    @Value("${jobportal.upload-dir:${user.dir}/uploads}")
    private String uploadDir;

    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> getUploadedFile(@PathVariable String filename) {
        return readUploadedFile(filename);
    }

    @GetMapping("/users/media/{filename:.+}")
    public ResponseEntity<Resource> getUserMedia(@PathVariable String filename) {
        return readUploadedFile(filename);
    }

    private ResponseEntity<Resource> readUploadedFile(String filename) {
        try {
            Path baseDir = Path.of(uploadDir).toAbsolutePath().normalize();
            Path target = baseDir.resolve(filename).normalize();

            // Prevent path traversal and only serve files inside upload directory.
            if (!target.startsWith(baseDir)) {
                return ResponseEntity.status(403).build();
            }

            if (!Files.exists(target) || !Files.isReadable(target) || Files.isDirectory(target)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(target.toUri());
            String contentType = Files.probeContentType(target);
            MediaType mediaType = contentType == null
                    ? MediaType.APPLICATION_OCTET_STREAM
                    : MediaType.parseMediaType(contentType);

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
