package com.example.FinFlow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    private final String uploadDir = "uploads/";

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile multipartFile) throws IOException {
        String fileName = StringUtils.cleanPath(multipartFile.getOriginalFilename());
        String fileExtension = "";
        
        int i = fileName.lastIndexOf('.');
        if (i > 0) {
            fileExtension = fileName.substring(i);
        }
        
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        try (InputStream inputStream = multipartFile.getInputStream()) {
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            
            String fileUrl = "http://localhost:8080/uploads/" + uniqueFileName;
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IOException ioe) {
            return ResponseEntity.status(500).body(Map.of("error", "Could not save image file: " + fileName));
        }
    }
}
