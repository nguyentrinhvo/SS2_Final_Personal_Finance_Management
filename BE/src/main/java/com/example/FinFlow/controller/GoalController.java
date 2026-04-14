package com.example.FinFlow.controller;

import com.example.FinFlow.model.Goal;
import com.example.FinFlow.model.User;
import com.example.FinFlow.repository.GoalRepository;
import com.example.FinFlow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class GoalController {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Goal>> getGoals(@PathVariable Long userId) {
        return ResponseEntity.ok(goalRepository.findByUser_UserId(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Goal> createGoal(@PathVariable Long userId, @RequestBody Goal goal) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            goal.setUser(user.get());
            return ResponseEntity.ok(goalRepository.save(goal));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/add/{amount}")
    public ResponseEntity<Goal> addFunds(@PathVariable Long id, @PathVariable double amount) {
        Optional<Goal> goalRaw = goalRepository.findById(id);
        if (goalRaw.isPresent()) {
            Goal goal = goalRaw.get();
            BigDecimal current = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : BigDecimal.ZERO;
            BigDecimal newAmount = current.add(BigDecimal.valueOf(amount));
            
            // Limit between 0 and targetAmount
            if (newAmount.compareTo(BigDecimal.ZERO) < 0) {
                newAmount = BigDecimal.ZERO;
            } else if (newAmount.compareTo(goal.getTargetAmount()) > 0) {
                newAmount = goal.getTargetAmount();
            }
            
            goal.setCurrentAmount(newAmount);
            return ResponseEntity.ok(goalRepository.save(goal));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @RequestBody Goal goalDetails) {
        Optional<Goal> goalRaw = goalRepository.findById(id);
        if (goalRaw.isPresent()) {
            Goal goal = goalRaw.get();
            goal.setName(goalDetails.getName());
            goal.setTargetAmount(goalDetails.getTargetAmount());
            goal.setCurrentAmount(goalDetails.getCurrentAmount());
            goal.setCategory(goalDetails.getCategory());
            goal.setImageUrl(goalDetails.getImageUrl());
            return ResponseEntity.ok(goalRepository.save(goal));
        }
        return ResponseEntity.notFound().build();
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
