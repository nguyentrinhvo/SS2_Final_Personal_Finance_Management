package com.example.FinFlow.controller;

import com.example.FinFlow.model.User;
import com.example.FinFlow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        Optional<User> userRaw = userRepository.findById(id);
        if (userRaw.isPresent()) {
            User user = userRaw.get();
            if (userDetails.getFullName() != null) user.setFullName(userDetails.getFullName());
            if (userDetails.getAvatarUrl() != null) user.setAvatarUrl(userDetails.getAvatarUrl());
            return ResponseEntity.ok(userRepository.save(user));
        }
        return ResponseEntity.notFound().build();
    }
}
