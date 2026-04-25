package com.example.FinFlow.controller;

import com.example.FinFlow.model.User;
import com.example.FinFlow.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String email = request.get("email");
            String password = request.get("password");
            String fullName = request.get("fullName");
            authService.register(username, email, password, fullName);
            return ResponseEntity.ok(Map.of("message", "Registration successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String loginId = request.get("username"); // Field from frontend is still called 'username'
        String password = request.get("password");
        Optional<User> user = authService.login(loginId, password);
        
        if (user.isPresent()) {
            User registeredUser = user.get();
            return ResponseEntity.ok(Map.of(
                "message", "Login successful", 
                "userId", registeredUser.getUserId(),
                "fullName", registeredUser.getFullName() != null ? registeredUser.getFullName() : registeredUser.getUsername(),
                "email", registeredUser.getEmail(),
                "avatarUrl", registeredUser.getAvatarUrl() != null ? registeredUser.getAvatarUrl() : ""
            ));
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newPassword = request.get("newPassword");
            authService.resetPassword(email, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
