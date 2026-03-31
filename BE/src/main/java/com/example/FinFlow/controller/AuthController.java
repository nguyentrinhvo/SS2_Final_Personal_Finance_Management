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
            String email = request.get("email");
            String password = request.get("password");
            String fullName = request.get("fullName"); // React sends 'fullName' or 'fullname'? Let's check Register.jsx
            authService.register(email, password, fullName);
            return ResponseEntity.ok(Map.of("message", "Registration successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        Optional<User> user = authService.login(email, password);
        
        if (user.isPresent()) {
            User registeredUser = user.get();
            return ResponseEntity.ok(Map.of(
                "message", "Login successful", 
                "userId", registeredUser.getUserId(),
                "fullName", registeredUser.getFullName() != null ? registeredUser.getFullName() : registeredUser.getEmail()
            ));
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
    }
}
