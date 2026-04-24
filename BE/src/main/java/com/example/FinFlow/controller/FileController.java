package com.example.FinFlow.controller;

import com.example.FinFlow.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private final CloudinaryService cloudinaryService;

    public FileController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile multipartFile) {
        try {
            String fileUrl = cloudinaryService.uploadFile(multipartFile);
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IOException ioe) {
            return ResponseEntity.status(500).body(Map.of("error", "Could not upload image to cloud: " + ioe.getMessage()));
        }
    }
}
