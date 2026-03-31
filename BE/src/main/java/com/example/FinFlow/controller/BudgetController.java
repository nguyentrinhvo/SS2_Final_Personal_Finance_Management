package com.example.FinFlow.controller;

import com.example.FinFlow.model.Budget;
import com.example.FinFlow.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    @GetMapping("/user/{userId}/current")
    public ResponseEntity<List<Budget>> getCurrentBudgets(@PathVariable Long userId) {
        LocalDate now = LocalDate.now();
        List<Budget> budgets = budgetRepository.findByUser_UserIdAndMonthAndYear(userId, now.getMonthValue(), now.getYear());
        return ResponseEntity.ok(budgets);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<Budget> createBudget(@PathVariable Long userId, @RequestBody Budget budget) {
        LocalDate now = LocalDate.now();
        budget.setMonth(now.getMonthValue());
        budget.setYear(now.getYear());
        // Simple logic: we'd need UserRepository to set User, but if we're doing it in controller:
        return ResponseEntity.ok(budgetRepository.save(budget));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
